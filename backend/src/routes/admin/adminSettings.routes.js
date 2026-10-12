import { Router } from "express";

import {
    getAdminSettingsController,
    updateAdminSettingsController,
} from "../../controllers/admin/adminSettings.controller.js";

import {
    adminAuthMiddleware,
} from "../../middleware/adminAuth.middleware.js";

import validate from "../../middleware/validation.middleware.js";

import {
    updateAdminSettingsSchema,
} from "../../validations/adminSettings.validation.js";

const router = Router();

// GET /api/v1/admin/settings
router.get("/", adminAuthMiddleware, getAdminSettingsController);

// PATCH /api/v1/admin/settings
router.patch("/", adminAuthMiddleware, validate(updateAdminSettingsSchema), updateAdminSettingsController);

export default router;