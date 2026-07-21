import mongoose from "mongoose";

const phoneSettingsSchema = new mongoose.Schema(
  {
    companyPhoneNumber: {
      type: String,
      trim: true,
      default: "",
    },
    callingEnabled: {
      type: Boolean,
      default: false,
    },
    callerIdStatus: {
      type: String,
      enum: ["not_configured", "pending_verification", "verified"],
      default: "not_configured",
    },
    twilioCallerIdSid: {
      type: String,
      trim: true,
      default: "",
      select: false,
    },
  },
  {
    _id: false,
  },
);

const settingSchema = new mongoose.Schema(
  {
    workspaceKey: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    companyName: {
      type: String,
      trim: true,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    phone: {
      type: phoneSettingsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  },
);

export const Setting = mongoose.model("Setting", settingSchema);
