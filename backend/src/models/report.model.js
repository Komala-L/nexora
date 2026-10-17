import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
    {
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        reportedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
            validate: {
                validator: function (value) {
                    return !this.reporter || !value.equals(this.reporter);
                },
                message: "Users cannot report themselves.",
            },
        },

        reason: {
            type: String,
            enum: [
                "harassment",
                "spam",
                "fake_profile",
                "inappropriate_content",
                "scam",
                "other",
            ],
            required: true,
        },

        description: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: "",
        },
        
        evidence: {
            type: [
                {
                    publicId: {
                        type: String,
                        required: true,
                    },
                    resourceType: {
                        type: String,
                        enum: ["image"],
                        default: "image",
                    },
                    mimeType: {
                        type: String,
                        enum: [
                            "image/jpeg",
                            "image/png",
                            "image/webp",
                        ],
                        required: true,
                    },
                    format: {
                        type: String,
                        default: "",
                    },
                    bytes: {
                        type: Number,
                        min: 0,
                    },
                    width: {
                        type: Number,
                        min: 0,
                    },
                    height: {
                        type: Number,
                        min: 0,
                    },
                },
            ],
            default: undefined,
            required: true,
            validate: [
                {
                    validator: (items) =>
                        Array.isArray(items) && items.length >= 1,
                    message: "At least one evidence image is required.",
                },
                {
                    validator: (items) =>
                        Array.isArray(items) && items.length <= 3,
                    message: "A report can contain at most 3 evidence images.",
                },
            ],
        },

        status: {
            type: String,
            enum: ["pending", "reviewing", "resolved", "dismissed"],
            default: "pending",
            index: true,
        },

        adminNotes: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: "",
        },

        accountAction: {
            type: String,
            enum: [
                "none",
                "warning",
                "temporary_suspension",
                "permanent_ban",
            ],
            default: "none",
        },

        warningLevel: {
            type: Number,
            enum: [1, 2, 3],
            default: null,
        },

        actionAppliedAt: {
            type: Date,
            default: null,
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            default: null,
        },

        reviewedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

reportSchema.index({ createdAt: -1 });
reportSchema.index({ status: 1, createdAt: -1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;