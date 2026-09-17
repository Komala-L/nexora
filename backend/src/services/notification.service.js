import Notification from "../models/notification.model.js";
import ApiError from "../utils/apiError.js";

/**
 * Create a notification.
 */
export const createNotification = async ({
    recipient,
    sender,
    type,
    connection = null,
    conversation = null,
    message = null,
}) => {
    if (recipient.toString() === sender.toString()) {
        throw new ApiError(
            400,
            "Users cannot receive notifications for their own actions"
        );
    }

    const notification = await Notification.create({
        recipient,
        sender,
        type,
        connection,
        conversation,
        message,
    });

    return notification;
};


/**
 * Get notifications for a user.
 */
export const getUserNotifications = async (
    userId,
    pagination = {}
) => {
    const page = Number(pagination.page) || 1;
    const limit = Number(pagination.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {
        recipient: userId,
    };

    const [notifications, total] = await Promise.all([
        Notification.find(filter)
            .populate(
                "sender",
                "_id name profilePic"
            )
            .sort({
                createdAt: -1,
            })
            .skip(skip)
            .limit(limit)
            .lean(),

        Notification.countDocuments(filter),
    ]);

    return {
        notifications,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};


/**
 * Get unread notification count for a user.
 */
export const getUnreadNotificationCount = async (
    userId
) => {
    return Notification.countDocuments({
        recipient: userId,
        read: false,
    });
};

/**
 * Mark a notification as read.
 */
export const markNotificationAsRead = async (
    notificationId,
    userId
) => {
    const notification = await Notification.findById(
        notificationId
    );

    if (!notification) {
        throw new ApiError(
            404,
            "Notification not found"
        );
    }

    if (
        notification.recipient.toString() !==
        userId.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to update this notification"
        );
    }

    if (!notification.read) {
        notification.read = true;
        await notification.save();
    }

    return notification;
};

/**
 * Mark all unread notifications as read.
 */
export const markAllNotificationsAsRead = async (
    userId
) => {
    const result = await Notification.updateMany(
        {
            recipient: userId,
            read: false,
        },
        {
            $set: {
                read: true,
            },
        }
    );

    return {
        modifiedCount: result.modifiedCount,
    };
};