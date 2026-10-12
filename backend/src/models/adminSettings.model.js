import mongoose from "mongoose";

const adminSettingsSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            default: "global",
            immutable: true,
        },

        platformName: {
            type: String,
            trim: true,
            required: true,
            maxlength: 60,
            default: "Nexora",
        },

        tagline: {
            type: String,
            trim: true,
            maxlength: 120,
            default: "Expand your Orbit",
        },

        supportEmail: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
            maxlength: 254,
            validate: {
                validator: function (value) {
                    return (
                        value === "" ||
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                    );
                },
                message: "Please provide a valid support email address.",
            },
        },

        maintenanceMode: {
            type: Boolean,
            default: false,
        },

        allowRegistration: {
            type: Boolean,
            default: true,
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const AdminSettings = mongoose.model(
    "AdminSettings",
    adminSettingsSchema
);

export default AdminSettings;