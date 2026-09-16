import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
    getUserNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "../services/notification.service.js";


/**
 * Get notifications for the authenticated user.
 */
export const getNotifications =
    asyncHandler(async (req, res) => {
        const result =
            await getUserNotifications(
                req.user._id,
                req.validatedQuery
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Notifications fetched successfully"
            )
        );
    });


/**
 * Get unread notification count
 * for the authenticated user.
 */
export const getUnreadCount =
    asyncHandler(async (req, res) => {
        const count =
            await getUnreadNotificationCount(
                req.user._id
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    count,
                },
                "Unread notification count fetched successfully"
            )
        );
    });

/**
 * Mark a notification as read.
 */
export const markAsRead =
    asyncHandler(async (req, res) => {
        const notification =
            await markNotificationAsRead(
                req.params.notificationId,
                req.user._id
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    notification,
                },
                "Notification marked as read successfully"
            )
        );
    });

/**
 * Mark all notifications as read.
 */
export const markAllAsRead =
    asyncHandler(async (req, res) => {
        const result =
            await markAllNotificationsAsRead(
                req.user._id
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "All notifications marked as read successfully"
            )
        );
    });