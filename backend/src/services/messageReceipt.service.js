import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import ApiError from "../utils/apiError.js";

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

    if (message.status === "sent") {
        message.status = "delivered";

        await message.save();
    }

    return message;
};