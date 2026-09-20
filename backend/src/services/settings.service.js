import User from "../models/user.model.js";
import Connection from "../models/connection.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import Notification from "../models/notification.model.js";
import ApiError from "../utils/apiError.js";

const getSettings = async (userId) => {
    const user = await User.findById(userId).select(
        "discoveryPreferences isDiscoverable"
    );

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return {
        discoveryPreferences: user.discoveryPreferences,
        isDiscoverable: user.isDiscoverable,
    };
};

const updateSettings = async (userId, settingsData) => {
    const user = await User.findById(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    if (
        settingsData.discoveryPreferences !== undefined
    ) {
        user.discoveryPreferences =
            settingsData.discoveryPreferences;
    }

    if (
        settingsData.isDiscoverable !== undefined
    ) {
        user.isDiscoverable =
            settingsData.isDiscoverable;
    }

    await user.save();

    return {
        discoveryPreferences: user.discoveryPreferences,
        isDiscoverable: user.isDiscoverable,
    };
};

export const deleteAccount = async (userId, currentPassword) => {
    const user = await User.findById(userId).select("+password");

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    const isPasswordValid =
        await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
        throw new ApiError(
            401,
            "Current password is incorrect."
        );
    }

    await Connection.deleteMany({
        $or: [
            { requester: userId },
            { recipient: userId },
        ],
    });

    const conversations = await Conversation.find({
        participants: userId,
    }).select("_id");

    const conversationIds = conversations.map(
        (conversation) => conversation._id
    );

    if (conversationIds.length > 0) {
        await Message.deleteMany({
            conversation: { $in: conversationIds },
        });

        await Conversation.deleteMany({
            _id: { $in: conversationIds },
        });
    }

    await Notification.deleteMany({
        user: userId,
    });

    await User.findByIdAndDelete(userId);

    return {
        message: "Account deleted successfully.",
    };
};

export {
    getSettings,
    updateSettings,
};