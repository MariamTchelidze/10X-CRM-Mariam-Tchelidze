import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, "Team member name is required."],
      trim: true,
      minlength: [2, "Team member name must contain at least 2 characters."],
      maxlength: [80, "Team member name must be shorter than 80 characters."],
    },
    email: {
      type: String,
      required: [true, "Team member email is required."],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.(com|net|org)$/i, "Email must end with .com, .net, or .org."],
    },
    role: {
      type: String,
      enum: ["Manager", "Sales", "Support"],
      required: true,
    },
    department: {
      type: String,
      enum: ["Management", "Sales Team", "Support Team"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Active"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  },
);

teamMemberSchema.index({ owner: 1, email: 1 }, { unique: true });

export const TeamMember = mongoose.model("TeamMember", teamMemberSchema);
