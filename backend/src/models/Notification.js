import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: [true, "Notification message is required."],
      trim: true,
      maxlength: [500, "Notification message must be shorter than 500 characters."],
    },
    taskId: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ owner: 1, createdAt: -1 });
notificationSchema.index({ owner: 1, status: 1 });

export const Notification = mongoose.model("Notification", notificationSchema);
