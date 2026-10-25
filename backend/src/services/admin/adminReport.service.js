import mongoose from "mongoose";
import Report from "../../models/report.model.js";
import {
    getReportEvidenceUrl,
} from "../cloudinary.service.js";

const getAdminReports = async ({
    page = 1,
    limit = 10,
    search = "",
    status = "",
} = {}) => {
    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(limit) || 10));

    const filter = {};

    if (status) {
        const allowedStatuses = [
            "pending",
            "reviewing",
            "resolved",
            "dismissed",
        ];

        if (!allowedStatuses.includes(status)) {
            const error = new Error("Invalid report status.");
            error.statusCode = 400;
            throw error;
        }

        filter.status = status;
    }

    const normalizedSearch = String(search).trim();

    if (normalizedSearch) {
        const escapedSearch = normalizedSearch.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        const searchRegex = new RegExp(escapedSearch, "i");

        const matchingUsers = await mongoose
            .model("User")
            .find({
                $or: [
                    { name: searchRegex },
                    { email: searchRegex },
                ],
            })
            .select("_id")
            .lean();

        const matchingUserIds = matchingUsers.map((user) => user._id);

        filter.$or = [
            { reason: searchRegex },
            { description: searchRegex },
            { adminNotes: searchRegex },
            { reporter: { $in: matchingUserIds } },
            { reportedUser: { $in: matchingUserIds } },
        ];
    }

    const [reports, totalReports] = await Promise.all([
        Report.find(filter)
            .populate("reporter", "name email profilePic.url")
            .populate("reportedUser", "name email profilePic.url")
            .populate("reviewedBy", "name email")
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * pageSize)
            .limit(pageSize)
            .lean(),

        Report.countDocuments(filter),
    ]);

    return {
        reports,
        pagination: {
            page: currentPage,
            limit: pageSize,
            totalReports,
            totalPages: Math.ceil(totalReports / pageSize),
        },
    };
};


const updateAdminReport = async ({
    reportId,
    status,
    adminNotes = "",
    adminId,
    accountAction = "none",
}) => {
    const fail = (statusCode, message) => {
        const error = new Error(message);
        error.statusCode = statusCode;
        return error;
    };

    if (!mongoose.isValidObjectId(reportId)) {
        throw fail(400, "Invalid report ID.");
    }

    if (!mongoose.isValidObjectId(adminId)) {
        throw fail(400, "Invalid admin ID.");
    }

    const allowedStatuses = [
        "pending",
        "reviewing",
        "resolved",
        "dismissed",
    ];

    const allowedActions = [
        "none",
        "warning",
        "temporary_suspension",
        "permanent_ban",
    ];

    if (!allowedStatuses.includes(status)) {
        throw fail(400, "Invalid report status.");
    }

    if (!allowedActions.includes(accountAction)) {
        throw fail(400, "Invalid account action.");
    }

    if (
        typeof adminNotes !== "string" ||
        adminNotes.length > 1000
    ) {
        throw fail(
            400,
            "Admin notes must be 1000 characters or fewer."
        );
    }

    if (accountAction !== "none" && status !== "resolved") {
        throw fail(
            400,
            "Resolve the report before applying a moderation action."
        );
    }

    const session = await mongoose.startSession();
    let updatedReportId;

    try {
        await session.withTransaction(async () => {
            const report = await Report.findById(reportId)
                .session(session);

            if (!report) {
                throw fail(404, "Report not found.");
            }

            if (report.actionAppliedAt && accountAction !== "none") {
                throw fail(
                    409,
                    "A moderation action has already been applied to this report."
                );
            }

            if (
                accountAction !== "none" &&
                report.status === "dismissed"
            ) {
                throw fail(
                    400,
                    "A dismissed report cannot result in account punishment."
                );
            }

            if (
                report.actionAppliedAt &&
                (status !== "resolved" || accountAction !== "none")
            ) {
                throw fail(
                    409,
                    "An actioned report must remain resolved."
                );
            }

            const now = new Date();
            const normalizedNotes = adminNotes.trim();

            if (accountAction === "none") {
                report.status = status;
                report.adminNotes = normalizedNotes;
                report.reviewedBy = adminId;
                report.reviewedAt = now;

                await report.save({ session });
                updatedReportId = report._id;
                return;
            }

            const User = mongoose.model("User");

            const user = await User.findById(report.reportedUser)
                .session(session);

            if (!user) {
                throw fail(404, "Reported user no longer exists.");
            }

            if (
                user.accountStatus === "banned"
            ) {
                throw fail(
                    409,
                    "This account is already permanently banned."
                );
            }

            const violationNumber =
                (user.confirmedViolationCount || 0) + 1;

            let appliedAction;
            let warningLevel = null;
            let expiresAt = null;

            if (violationNumber <= 3) {
                appliedAction = "warning";
                warningLevel = violationNumber;
            } else if (violationNumber === 4) {
                appliedAction = "temporary_suspension";
                expiresAt = new Date(
                    now.getTime() + 7 * 24 * 60 * 60 * 1000
                );
            } else {
                appliedAction = "permanent_ban";
            }

            if (
                accountAction === "temporary_suspension" &&
                appliedAction !== "permanent_ban"
            ) {
                appliedAction = "temporary_suspension";
                warningLevel = null;
                expiresAt = new Date(
                    now.getTime() + 7 * 24 * 60 * 60 * 1000
                );
            }

            if (accountAction === "permanent_ban") {
                appliedAction = "permanent_ban";
                warningLevel = null;
                expiresAt = null;
            }

            user.confirmedViolationCount = violationNumber;

            if (appliedAction === "warning") {
                user.warningCount = Math.max(
                    user.warningCount || 0,
                    warningLevel
                );
            }

            if (appliedAction === "temporary_suspension") {
                user.accountStatus = "suspended";
                user.suspensionExpiresAt = expiresAt;

                user.refreshToken = undefined;
            }

            if (appliedAction === "permanent_ban") {
                user.accountStatus = "banned";
                user.suspensionExpiresAt = null;

                user.refreshToken = undefined;
            }

            const historyAction =
                appliedAction === "warning" && warningLevel === 3
                    ? "final_warning"
                    : appliedAction;

            user.moderationHistory.push({
                action: historyAction,
                reason: normalizedNotes || report.reason,
                report: report._id,
                admin: adminId,
                createdAt: now,
                expiresAt,
            });

            report.status = "resolved";
            report.adminNotes = normalizedNotes;
            report.reviewedBy = adminId;
            report.reviewedAt = now;
            report.accountAction = appliedAction;
            report.warningLevel = warningLevel;
            report.actionAppliedAt = now;

            await user.save({ session });
            await report.save({ session });

            updatedReportId = report._id;
        });
    } finally {
        await session.endSession();
    }

    return Report.findById(updatedReportId)
        .populate("reporter", "name email profilePic.url")
        .populate("reportedUser", "name email profilePic.url")
        .populate("reviewedBy", "name email")
        .lean();
};


const getReportEvidence = async ({
    reportId,
    evidenceIndex,
}) => {
    const fail = (statusCode, message) => {
        const error = new Error(message);
        error.statusCode = statusCode;
        return error;
    };

    if (!mongoose.isValidObjectId(reportId)) {
        throw fail(400, "Invalid report ID.");
    }

    const indexValue = String(evidenceIndex);

    if (!/^(0|[1-2])$/.test(indexValue)) {
        throw fail(400, "Invalid evidence index.");
    }

    const report = await Report.findById(reportId)
        .select("evidence")
        .lean();

    if (!report) {
        throw fail(404, "Report not found.");
    }

    const evidence = report.evidence?.[Number(indexValue)];

    if (!evidence?.publicId) {
        throw fail(404, "Report evidence not found.");
    }

    try {
        const url = await getReportEvidenceUrl(
            evidence.publicId
        );

        return {
            url,
            format: evidence.format,
            bytes: evidence.bytes,
            width: evidence.width,
            height: evidence.height,
        };
    } catch (error) {
        if (error.statusCode) {
            throw error;
        }

        throw fail(
            502,
            "Unable to retrieve report evidence."
        );
    }
};

export {
    getAdminReports,
    updateAdminReport,
    getReportEvidence,
};