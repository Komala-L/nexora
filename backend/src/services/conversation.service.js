import Connection from "../models/connection.model.js";
import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";


const ensureUserExists = async (userId) => {
    const userExists = await User.exists({
        _id: userId,
    });

    if (!userExists) {
        throw new ApiError(
            404,
            "User not found"
        );
    }
};


const getAcceptedConnection = async (
    userId,
    otherUserId
) => {
    const connection = await Connection.findOne({
        status: "accepted",
        $or: [
            {
                requester: userId,
                recipient: otherUserId,
            },
            {
                requester: otherUserId,
                recipient: userId,
            },
        ],
    });

    if (!connection) {
        throw new ApiError(
            403,
            "You can only message users you are connected with"
        );
    }

    return connection;
};


export const createConversation = async (
    userId,
    otherUserId
) => {
    if (
        userId.toString() ===
        otherUserId.toString()
    ) {
        throw new ApiError(
            400,
            "You cannot create a conversation with yourself"
        );
    }

    await ensureUserExists(otherUserId);

    const connection = await getAcceptedConnection(
        userId,
        otherUserId
    );

    const existingConversation =
        await Conversation.findOne({
            pairKey: connection.pairKey,
        });

    if (existingConversation) {
        return existingConversation;
    }

    const conversation = await Conversation.create({
        participants: [
            connection.requester,
            connection.recipient,
        ],
        pairKey: connection.pairKey,
    });

    return conversation;
};

export const getUserConversations = async (
    userId,
    pagination = {}
) => {
    const page = Number(pagination.page) || 1;
    const limit = Number(pagination.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {
        participants: userId,
    };

    const [conversations, total] = await Promise.all([
        Conversation.find(filter)
            .populate(
                "participants",
                "_id name profilePic"
            )
            .sort({
                lastMessageAt: -1,
                updatedAt: -1,
            })
            .skip(skip)
            .limit(limit)
            .lean(),

        Conversation.countDocuments(filter),
    ]);

    return {
        conversations,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getConversationById = async (
    conversationId,
    userId
) => {
    const conversation =
        await Conversation.findById(conversationId)
            .populate(
                "participants",
                "_id name profilePic"
            )
            .lean();

    if (!conversation) {
        throw new ApiError(
            404,
            "Conversation not found"
        );
    }

    const isParticipant =
        conversation.participants.some(
            (participant) =>
                participant._id.toString() ===
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