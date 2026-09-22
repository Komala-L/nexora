import {
    getSettings,
    updateSettings,
} from "../services/settings.service.js";

const getUserSettings = async (req, res, next) => {
    try {
        const settings = await getSettings(req.user._id);

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Settings fetched successfully",
            data: {
                settings,
            },
        });
    } catch (error) {
        next(error);
    }
};

const updateUserSettings = async (req, res, next) => {
    try {
        const settings = await updateSettings(
            req.user._id,
            req.body
        );

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Settings updated successfully",
            data: {
                settings,
            },
        });
    } catch (error) {
        next(error);
    }
};

export {
    getUserSettings,
    updateUserSettings,
};