import { Router } from "express";

import {
    getAdminReportsController,
    updateAdminReportController,
} from "../../controllers/admin/adminReport.controller.js";

import { adminAuthMiddleware } from "../../middleware/adminAuth.middleware.js";

const router = Router();

// GET /api/v1/admin/reports
router.get("/", adminAuthMiddleware, getAdminReportsController);

// PATCH /api/v1/admin/reports/:reportId
router.patch("/:reportId", adminAuthMiddleware, updateAdminReportController);

export default router;
