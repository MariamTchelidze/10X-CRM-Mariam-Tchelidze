import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    conversation: {
      type: String,
      required: [true, "Conversation recipient is required."],
      trim: true,
      maxlength: [120, "Conversation name must be shorter than 120 characters."],
    },
    role: {
      type: String,
      enum: ["user", "teammate", "system"],
      default: "user",
    },
    author: {
      type: String,
      trim: true,
      default: "You",
    },
    recipient: {
      type: String,
      required: [true, "Recipient is required."],
      trim: true,
      maxlength: [120, "Recipient must be shorter than 120 characters."],
    },
    text: {
      type: String,
      required: [true, "Message text is required."],
      trim: true,
      maxlength: [2000, "Message must be shorter than 2000 characters."],
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ owner: 1, conversation: 1, createdAt: 1 });

export const Message = mongoose.model("Message", messageSchema);
