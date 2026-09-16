import mongoose from "mongoose";

const { Schema } = mongoose;

const notificationSchema = new Schema(
    {
        recipient: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            immutable: true,
        },

        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            immutable: true,
        },

        type: {
            type: String,
            enum: [
                "connection_request",
                "connection_accepted",
                "connection_rejected",
                "message",
            ],
            required: true,
            immutable: true,
        },

        connection: {
            type: Schema.Types.ObjectId,
            ref: "Connection",
            default: null,
            immutable: true,
        },

        conversation: {
            type: Schema.Types.ObjectId,
            ref: "Conversation",
            default: null,
            immutable: true,
        },

        message: {
            type: Schema.Types.ObjectId,
            ref: "Message",
            default: null,
            immutable: true,
        },

        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

notificationSchema.index({
    recipient: 1,
    createdAt: -1,
});

notificationSchema.index({
    recipient: 1,
    read: 1,
    createdAt: -1,
});

const Notification = mongoose.model(
    "Notification",
    notificationSchema
);

export default Notification;