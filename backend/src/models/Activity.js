import mongoose from "mongoose";

const activityDetailSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      trim: true,
      default: "",
    },
    value: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: false,
  },
);

const activitySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      trim: true,
      default: "general",
    },
    icon: {
      type: String,
      trim: true,
      default: "clock",
    },
    title: {
      type: String,
      required: [true, "Activity title is required."],
      trim: true,
      maxlength: [180, "Activity title must be shorter than 180 characters."],
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [300, "Activity summary must be shorter than 300 characters."],
      default: "Account activity was recorded.",
    },
    status: {
      type: String,
      trim: true,
      default: "Updated",
    },
    relatedLabel: {
      type: String,
      trim: true,
      default: "CRM",
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1200, "Activity description must be shorter than 1200 characters."],
      default: "Account activity was recorded.",
    },
    details: {
      type: [activityDetailSchema],
      default: [],
    },
    actionHref: {
      type: String,
      trim: true,
      default: "./dashboard.html#activity",
    },
    actionLabel: {
      type: String,
      trim: true,
      default: "Open Activity",
    },
  },
  {
    timestamps: true,
  },
);

activitySchema.index({ owner: 1, createdAt: -1 });
activitySchema.index({ owner: 1, type: 1 });

export const Activity = mongoose.model("Activity", activitySchema);
