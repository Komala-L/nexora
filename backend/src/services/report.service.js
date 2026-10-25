import mongoose from "mongoose";
import Report from "../models/report.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { uploadReportEvidence, deleteReportEvidence } from "./cloudinary.service.js";

const ALLOWED_REASONS = [
    "harassment",
    "spam",
    "fake_profile",
    "inappropriate_content",
    "scam",
    "other",
];

export const createUserReport = async ({
    reporterId,
    reportedUserId,
    reason,
    description = "",
    evidenceFiles = [],
}) => {
    if (!mongoose.isValidObjectId(reportedUserId)) {
        throw new ApiError(400, "Invalid user ID.");
    }

    if (reporterId.toString() === reportedUserId.toString()) {
        throw new ApiError(400, "You cannot report your own profile.");
    }

    if (!ALLOWED_REASONS.includes(reason)) {
        throw new ApiError(400, "Please select a valid report reason.");
    }

    if (typeof description !== "string") {
        throw new ApiError(400, "Description must be text.");
    }

    const cleanedDescription = description.trim();

    if (cleanedDescription.length > 1000) {
        throw new ApiError(400, "Description cannot exceed 1000 characters.");
    }

    if (!Array.isArray(evidenceFiles) || evidenceFiles.length < 1) {
        throw new ApiError(
           400,
           "At least one screenshot is required to submit a report."
        );
    }

    if (evidenceFiles.length > 3) {
        throw new ApiError(
            400,
            "You can attach up to 3 evidence images."
        );
    }

    const reportedUser = await User.findById(reportedUserId).select("_id");

    if (!reportedUser) {
        throw new ApiError(404, "The user you want to report was not found.");
    }

    const uploadedEvidence = [];

    try {
        for (const file of evidenceFiles) {
            if (!file?.buffer || !file.mimetype) {
                throw new ApiError(400, "An evidence image is invalid.");
            }

            if (
                !["image/jpeg", "image/png", "image/webp"].includes(
                    file.mimetype
                )
            ) {
                throw new ApiError(
                    400,
                    "Only JPEG, PNG, and WebP evidence images are allowed."
                );
            }

            const evidence = await uploadReportEvidence(file.buffer);

            uploadedEvidence.push({
                ...evidence,
                mimeType: file.mimetype,
            });
        }

        const report = await Report.create({
            reporter: reporterId,
            reportedUser: reportedUserId,
            reason,
            description: cleanedDescription,
            evidence: uploadedEvidence,
            status: "pending",
        });

        return {
            reportId: report._id,
            status: report.status,
        };
    } catch (error) {
        await Promise.allSettled(
            uploadedEvidence.map((item) =>
                deleteReportEvidence(item.publicId)
            )
        );

        throw error;
    }
};