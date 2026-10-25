import {
    getAdminReports,
    updateAdminReport,
} from "../../services/admin/adminReport.service.js";

import {
    getReportEvidence,
} from "../../services/admin/adminReport.service.js";

const getAdminReportsController = async (req, res, next) => {
    try {
        const result = await getAdminReports({
            page: req.query.page,
            limit: req.query.limit,
            search: req.query.search,
            status: req.query.status,
        });

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Admin reports fetched successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateAdminReportController = async (req, res, next) => {
    try {
        const report = await updateAdminReport({
            reportId: req.params.reportId,
            status: req.body.status,
            adminNotes: req.body.adminNotes ?? "",
            adminId: req.admin._id,
            accountAction: req.body.accountAction ?? "none",
        });

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Report updated successfully.",
            data: { report },
        });
    } catch (error) {
        next(error);
    }
};

const getAdminReportEvidenceController = async (
    req,
    res,
    next
) => {
    try {
        const evidence = await getReportEvidence({
            reportId: req.params.reportId,
            evidenceIndex: req.params.evidenceIndex,
        });

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Report evidence retrieved successfully.",
            data: { evidence },
        });
    } catch (error) {
        next(error);
    }
};

export {
    getAdminReportsController,
    updateAdminReportController,
    getAdminReportEvidenceController,
};