import mongoose from "mongoose";
import { TASK_STATUSES } from "../constants/taskStatuses.js";

const subtaskSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Checklist item text is required."],
      trim: true,
      maxlength: [240, "Checklist item must be shorter than 240 characters."],
    },
    done: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      trim: true,
      default: "CRM User",
    },
    mention: {
      type: String,
      trim: true,
      default: "",
    },
    message: {
      type: String,
      required: [true, "Comment message is required."],
      trim: true,
      maxlength: [1200, "Comment must be shorter than 1200 characters."],
    },
  },
  {
    timestamps: true,
  },
);

const taskSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required."],
      trim: true,
      maxlength: [120, "Task title must be shorter than 120 characters."],
    },
    client: {
      type: String,
      required: [true, "Client name is required."],
      trim: true,
      maxlength: [120, "Client name must be shorter than 120 characters."],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1200, "Task description must be shorter than 1200 characters."],
      default: "",
    },
    dueDate: {
      type: String,
      trim: true,
      default: "No due date",
    },
    dueAt: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Low",
    },
    color: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: "todo",
    },
    assignee: {
      type: String,
      trim: true,
      default: "Unassigned",
    },
    subtasks: {
      type: [subtaskSchema],
      default: [],
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
    archived: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

taskSchema.index({ owner: 1, status: 1 });
taskSchema.index({ owner: 1, archived: 1, deleted: 1 });
taskSchema.index({ owner: 1, dueAt: 1 });

export const Task = mongoose.model("Task", taskSchema);
