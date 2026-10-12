import AdminSettings from "../../models/adminSettings.model.js";
import ApiError from "../../utils/apiError.js";

const GLOBAL_SETTINGS_KEY = "global";

const DEFAULT_SETTINGS = {
    platformName: "Nexora",
    tagline: "Expand your Orbit",
    supportEmail: "",
    maintenanceMode: false,
    allowRegistration: true,
};

const getAdminSettings = async () => {
    let settings = await AdminSettings.findOne({
        key: GLOBAL_SETTINGS_KEY,
    });

    if (!settings) {
        settings = await AdminSettings.create({
            key: GLOBAL_SETTINGS_KEY,
            ...DEFAULT_SETTINGS,
        });
    }

    return settings;
};

const updateAdminSettings = async (settingsData, adminId) => {
    const allowedFields = [
        "platformName",
        "tagline",
        "supportEmail",
        "maintenanceMode",
        "allowRegistration",
    ];

    const updates = {};

    for (const field of allowedFields) {
        if (settingsData[field] !== undefined) {
            updates[field] = settingsData[field];
        }
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No valid settings were provided.");
    }

    let settings = await AdminSettings.findOne({
        key: GLOBAL_SETTINGS_KEY,
    });

    if (!settings) {
        settings = new AdminSettings({
            key: GLOBAL_SETTINGS_KEY,
            ...DEFAULT_SETTINGS,
        });
    }

    Object.assign(settings, updates);
    settings.updatedBy = adminId;

    await settings.save();

    return settings;
};

export { getAdminSettings, updateAdminSettings };