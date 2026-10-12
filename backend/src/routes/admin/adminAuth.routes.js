import { Router } from "express";

import {
    loginAdminController,
    refreshAdminAccessToken,
    logoutAdmin,
    getCurrentAdmin
} from "../../controllers/admin/adminAuth.controller.js";

import {
    adminAuthMiddleware,
} from "../../middleware/adminAuth.middleware.js";

const router = Router();

// POST /api/v1/admin/auth/login
router.post("/login",loginAdminController);

// POST /api/v1/admin/auth/refresh-token
router.post("/refresh-token",refreshAdminAccessToken);

// POST /api/v1/admin/auth/logout
router.post("/logout",adminAuthMiddleware,logoutAdmin);

// GET /api/v1/admin/auth/me
router.get("/me",adminAuthMiddleware,getCurrentAdmin);

export default router;