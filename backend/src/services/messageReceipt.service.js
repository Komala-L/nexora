import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import ApiError from "../utils/apiError.js";
import Notification from "../models/notification.model.js";

/**
 * Mark a message as delivered.
 */
export const markMessageDelivered = async (
    messageId,
    userId
) => {
    const message =
        await Message.findById(messageId);

    if (!message) {
        throw new ApiError(
            404,
            "Message not found"
        );
    }

    const conversation =
        await Conversation.findById(
            message.conversation
        );

    if (!conversation) {
        throw new ApiError(
            404,
            "Conversation not found"
        );
    }

    const isParticipant =
        conversation.participants.some(
            (participant) =>
                participant.toString() ===
                userId.toString()
        );

    if (!isParticipant) {
        throw new ApiError(
            403,
            "You are not authorized to update this message"
        );
    }

    if (
        message.sender.toString() !==
        userId.toString()
    ) {
        if (!message.deliveredAt) {
            message.deliveredAt = new Date();

            await message.save();
        }
    }

    return message;
};


/**
 * Mark a message as read.
 */
export const markMessageRead = async (
    messageId,
    userId
) => {
    const message =
        await Message.findById(messageId);

    if (!message) {
        throw new ApiError(
            404,
            "Message not found"
        );
    }

    const conversation =
        await Conversation.findById(
            message.conversation
        );

    if (!conversation) {
        throw new ApiError(
            404,
            "Conversation not found"
        );
    }

    const isParticipant =
        conversation.participants.some(
            (participant) =>
                participant.toString() ===
                userId.toString()
        );

    if (!isParticipant) {
        throw new ApiError(
            403,
            "You are not authorized to update this message"
        );
    }

    if (
        message.sender.toString() !==
        userId.toString()
    ) {
        if (!message.readAt) {
            if (!message.deliveredAt) {
                message.deliveredAt = new Date();
            }

            message.readAt = new Date();

            await message.save();

            await Notification.updateOne(
                {
                    recipient: userId,
                    message: message._id,
                    read: false,
                },
                {
                    $set: {
                        read: true,
                    },
                }
            );
        }
    }

    return message;
};