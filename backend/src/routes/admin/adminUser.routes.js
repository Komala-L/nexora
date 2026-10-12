import { Router } from "express";

import {
    getAdminUsersController,
    getAdminDashboardStatsController,
    getAdminUserByIdController,
    getAdminPlatformActivityController,
} from "../../controllers/admin/adminUser.controller.js";

import { adminAuthMiddleware } from "../../middleware/adminAuth.middleware.js";

const router = Router();

// GET /api/v1/admin/users
router.get("/", adminAuthMiddleware, getAdminUsersController);

// GET /api/v1/admin/users/stats
router.get("/stats", adminAuthMiddleware, getAdminDashboardStatsController);

// GET /api/v1/admin/users/activity?days=7
router.get("/activity",adminAuthMiddleware,getAdminPlatformActivityController);

// GET /api/v1/admin/users/:userId
router.get("/:userId", adminAuthMiddleware, getAdminUserByIdController);

export default router;