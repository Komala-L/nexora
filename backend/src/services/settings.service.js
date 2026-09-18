import User from "../models/user.model.js";

const getSettings = async (userId) => {
    const user = await User.findById(userId).select(
        "discoveryPreferences"
    );

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return {
        discoveryPreferences: user.discoveryPreferences,
    };
};

const updateSettings = async (userId, settingsData) => {
    const user = await User.findById(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    user.discoveryPreferences = settingsData.discoveryPreferences;

    await user.save();

    return {
        discoveryPreferences: user.discoveryPreferences,
    };
};

export {
    getSettings,
    updateSettings,
};