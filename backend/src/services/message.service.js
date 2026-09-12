import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import ApiError from "../utils/apiError.js";


const getConversationForUser = async (
    conversationId,
    userId
) => {
    const conversation =
        await Conversation.findById(conversationId);

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
            "You are not authorized to access this conversation"
        );
    }

    return conversation;
};


export const sendMessage = async (
    conversationId,
    senderId,
    content
) => {
    const conversation =
        await getConversationForUser(
            conversationId,
            senderId
        );

    const message = await Message.create({
        conversation: conversation._id,
        sender: senderId,
        content,
    });

    conversation.lastMessageAt = message.createdAt;

    await conversation.save();

    return message;
};

export const getConversationMessages = async (
    conversationId,
    userId,
    pagination = {}
) => {
    const conversation =
        await getConversationForUser(
            conversationId,
            userId
        );

    const page = Number(pagination.page) || 1;
    const limit = Number(pagination.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {
        conversation: conversation._id,
    };

    const [messages, total] = await Promise.all([
        Message.find(filter)
            .populate(
                "sender",
                "_id name profilePic"
            )
            .sort({
                createdAt: 1,
            })
            .skip(skip)
            .limit(limit)
            .lean(),

        Message.countDocuments(filter),
    ]);

    return {
        messages,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};