import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required."],
      trim: true,
      minlength: [2, "Full name must contain at least 2 characters."],
      maxlength: [80, "Full name must be shorter than 80 characters."],
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, "Company name must be shorter than 100 characters."],
      default: "",
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^\S+@\S+\.(com|net|org)$/i, "Email must end with .com, .net, or .org."],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must contain at least 8 characters."],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "manager", "sales", "support", "user"],
      default: "user",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [600, "Bio must be shorter than 600 characters."],
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("User", userSchema);
