import mongoose from "mongoose";

const { Schema } = mongoose;

const conversationSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    pairKey: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
    },

    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

conversationSchema.pre("validate", function () {
  if (
    this.participants &&
    this.participants.length === 2 &&
    this.participants[0].toString() ===
      this.participants[1].toString()
  ) {
    throw new Error(
      "Conversation participants must be different users"
    );
  }
});

conversationSchema.index({
  participants: 1,
  lastMessageAt: -1,
});

const Conversation = mongoose.model(
  "Conversation",
  conversationSchema
);

export default Conversation;