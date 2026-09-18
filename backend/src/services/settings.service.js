import User from "../models/user.model.js";

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

export {
    getSettings,
    updateSettings,
};