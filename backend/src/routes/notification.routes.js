import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    validateQuery,
} from "../middleware/validation.middleware.js";

import {
    getConnectionsQuerySchema,
} from "../validations/connection.validation.js";

import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} from "../controllers/notification.controller.js";

const router = Router();

/**
 * Get notifications for the authenticated user.
 */
router.get("/",verifyJWT,validateQuery(getConnectionsQuerySchema),getNotifications);

/**
 * Get unread notification count.
 */
router.get("/unread-count",verifyJWT,getUnreadCount);

/**
 * Mark all notifications as read.
 */
router.patch("/read-all",verifyJWT,markAllAsRead);

/**
 * Mark a notification as read.
 */
router.patch("/:notificationId/read",verifyJWT,markAsRead);

export default router;