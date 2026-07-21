import mongoose from "mongoose";
import { CLIENT_STATUSES } from "../constants/clientStatuses.js";

const clientNoteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Note text is required."],
      trim: true,
      maxlength: [1200, "Note must be shorter than 1200 characters."],
    },
    author: {
      type: String,
      trim: true,
      default: "CRM User",
    },
    status: {
      type: String,
      enum: ["", "reviewed", "approved", "declined", "processed"],
      default: "",
    },
    taskId: {
      type: String,
      trim: true,
      default: "",
    },
    taskTitle: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const clientSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Client name is required."],
      trim: true,
      minlength: [3, "Client name must contain at least 3 characters."],
      maxlength: [100, "Client name must be shorter than 100 characters."],
    },
    company: {
      type: String,
      required: [true, "Company is required."],
      trim: true,
      maxlength: [120, "Company must be shorter than 120 characters."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.(com|net|org)$/i, "Email must end with .com, .net, or .org."],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [40, "Phone number must be shorter than 40 characters."],
      default: "",
    },
    country: {
      type: String,
      trim: true,
      maxlength: [80, "Country must be shorter than 80 characters."],
      default: "",
    },
    timezone: {
      type: String,
      trim: true,
      maxlength: [80, "Timezone must be shorter than 80 characters."],
      default: "",
    },
    status: {
      type: String,
      enum: CLIENT_STATUSES,
      default: "lead",
    },
    dealValue: {
      type: Number,
      min: [0, "Deal value cannot be negative."],
      default: 0,
    },
    notes: {
      type: [clientNoteSchema],
      default: [],
    },
    reminderAt: {
      type: Date,
      default: null,
    },
    reminderNotified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

clientSchema.index({ owner: 1, email: 1 }, { unique: true });
clientSchema.index({ owner: 1, status: 1 });
clientSchema.index({ owner: 1, createdAt: -1 });

export const Client = mongoose.model("Client", clientSchema);
