import {
    getAdminSettings,
    updateAdminSettings,
} from "../../services/admin/adminSettings.service.js";

const getAdminSettingsController = async (req, res, next) => {
    try {
        const settings = await getAdminSettings();

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Admin settings fetched successfully.",
            data: { settings },
        });
    } catch (error) {
        next(error);
    }
};

const updateAdminSettingsController = async (req, res, next) => {
    try {
        const settings = await updateAdminSettings(
            req.body,
            req.admin._id
        );

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Admin settings updated successfully.",
            data: { settings },
        });
    } catch (error) {
        next(error);
    }
};

export {
    getAdminSettingsController,
    updateAdminSettingsController,
};
