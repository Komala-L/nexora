import mongoose from "mongoose";

const { Schema } = mongoose;

const attachmentSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    mimeType: {
      type: String,
      required: true,
      trim: true,
    },

    size: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const messageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
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
      enum: ["text", "image", "document"],
      default: "text",
      required: true,
    },

    content: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    attachments: {
      type: [attachmentSchema],
      default: [],
    },

    sentAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    readAt: {
      type: Date,
      default: null,
    },

    deletedFor: [
      {
          type: Schema.Types.ObjectId,
          ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

messageSchema.index({
    conversation: 1,
    createdAt: 1,
});

const Message = mongoose.model(
    "Message",
    messageSchema
);

export default Message;