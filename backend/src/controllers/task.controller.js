import mongoose from "mongoose";
import { Task } from "../models/Task.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sanitizeString } from "../utils/sanitize.js";

const buildNestedItems = (items = []) => {
  return items.map((item) => ({
    ...item.toObject?.() || item,
    id: item._id?.toString?.() || item.id,
  }));
};

const buildTaskResponse = (task) => ({
  id: task._id.toString(),
  title: task.title,
  client: task.client,
  description: task.description,
  dueDate: task.dueDate,
  dueAt: task.dueAt,
  priority: task.priority,
  color: task.color,
  status: task.status,
  assignee: task.assignee,
  subtasks: buildNestedItems(task.subtasks),
  comments: buildNestedItems(task.comments),
  archived: task.archived,
  deleted: task.deleted,
  deletedAt: task.deletedAt,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

const getOwnedTask = async (request) => {
  if (!mongoose.isValidObjectId(request.params.taskId)) {
    throw new ApiError(400, "Invalid task id.");
  }

  const task = await Task.findOne({
    _id: request.params.taskId,
    owner: request.user._id,
  });

  if (!task) {
    throw new ApiError(404, "Task was not found.");
  }

  return task;
};

const normalizeSubtasks = (subtasks) => {
  if (!Array.isArray(subtasks)) return undefined;

  return subtasks
    .map((subtask) => ({
      text: sanitizeString(subtask.text),
      done: Boolean(subtask.done),
    }))
    .filter((subtask) => subtask.text);
};

const normalizeComments = (comments) => {
  if (!Array.isArray(comments)) return undefined;

  return comments
    .map((comment) => ({
      author: sanitizeString(comment.author) || "CRM User",
      mention: sanitizeString(comment.mention),
      message: sanitizeString(comment.message),
      createdAt: comment.createdAt,
    }))
    .filter((comment) => comment.message);
};

const buildTaskPayload = (body) => {
  const payload = {};
  const subtasks = normalizeSubtasks(body.subtasks);
  const comments = normalizeComments(body.comments);

  if (body.title !== undefined) payload.title = sanitizeString(body.title);
  if (body.client !== undefined) payload.client = sanitizeString(body.client);
  if (body.description !== undefined) payload.description = sanitizeString(body.description);
  if (body.dueDate !== undefined) payload.dueDate = sanitizeString(body.dueDate);
  if (body.dueAt !== undefined) payload.dueAt = body.dueAt || null;
  if (body.priority !== undefined) payload.priority = body.priority;
  if (body.color !== undefined) payload.color = sanitizeString(body.color);
  if (body.status !== undefined) payload.status = body.status;
  if (body.assignee !== undefined) payload.assignee = sanitizeString(body.assignee) || "Unassigned";
  if (body.archived !== undefined) payload.archived = Boolean(body.archived);
  if (body.deleted !== undefined) payload.deleted = Boolean(body.deleted);
  if (body.deletedAt !== undefined) payload.deletedAt = body.deletedAt || null;
  if (subtasks) payload.subtasks = subtasks;
  if (comments) payload.comments = comments;

  return payload;
};

export const getTasks = asyncHandler(async (request, response) => {
  const { status = "all", archived = "all", deleted = "all" } = request.query;
  const query = { owner: request.user._id };

  if (status !== "all") query.status = status;
  if (archived !== "all") query.archived = archived === "true";
  if (deleted !== "all") query.deleted = deleted === "true";

  const tasks = await Task.find(query).sort({ createdAt: -1 });

  response.status(200).json({
    status: "success",
    results: tasks.length,
    tasks: tasks.map(buildTaskResponse),
  });
});

export const createTask = asyncHandler(async (request, response) => {
  const task = await Task.create({
    ...buildTaskPayload(request.body),
    owner: request.user._id,
  });

  response.status(201).json({
    status: "success",
    task: buildTaskResponse(task),
  });
});

export const getTask = asyncHandler(async (request, response) => {
  const task = await getOwnedTask(request);

  response.status(200).json({
    status: "success",
    task: buildTaskResponse(task),
  });
});

export const updateTask = asyncHandler(async (request, response) => {
  const task = await getOwnedTask(request);

  Object.assign(task, buildTaskPayload(request.body));
  await task.save();

  response.status(200).json({
    status: "success",
    task: buildTaskResponse(task),
  });
});

export const deleteTask = asyncHandler(async (request, response) => {
  const task = await getOwnedTask(request);

  await task.deleteOne();

  response.status(200).json({
    status: "success",
    message: "Task deleted permanently.",
    taskId: request.params.taskId,
  });
});
