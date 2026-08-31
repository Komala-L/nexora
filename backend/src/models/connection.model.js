import mongoose from "mongoose";

const { Schema } = mongoose;

const connectionSchema = new Schema(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },

    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },

    pairKey: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

connectionSchema.pre("validate", function () {
  if (
    this.requester &&
    this.recipient &&
    this.requester.toString() === this.recipient.toString()
  ) {
    throw new Error(
      "Requester and recipient cannot be the same user"
    );
  }
});

connectionSchema.index({ recipient: 1, status: 1, createdAt: -1 });
connectionSchema.index({ requester: 1, status: 1, createdAt: -1 });

connectionSchema.index({ requester: 1, createdAt: -1 });
connectionSchema.index({ recipient: 1, createdAt: -1 });

const Connection = mongoose.model("Connection", connectionSchema);
export default Connection;