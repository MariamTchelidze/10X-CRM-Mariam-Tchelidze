import mongoose from "mongoose";
import { Notification } from "../models/Notification.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sanitizeString } from "../utils/sanitize.js";

const buildNotificationResponse = (notification) => ({
  id: notification._id.toString(),
  message: notification.message,
  taskId: notification.taskId,
  read: notification.status === "read",
  status: notification.status,
  selected: notification.selected,
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});

const getOwnedNotification = async (request) => {
  if (!mongoose.isValidObjectId(request.params.notificationId)) {
    throw new ApiError(400, "Invalid notification id.");
  }

  const notification = await Notification.findOne({
    _id: request.params.notificationId,
    owner: request.user._id,
  });

  if (!notification) {
    throw new ApiError(404, "Notification was not found.");
  }

  return notification;
};

export const getNotifications = asyncHandler(async (request, response) => {
  const notifications = await Notification.find({ owner: request.user._id }).sort({ createdAt: -1 });

  response.status(200).json({
    status: "success",
    results: notifications.length,
    notifications: notifications.map(buildNotificationResponse),
  });
});

export const createNotification = asyncHandler(async (request, response) => {
  const notification = await Notification.create({
    owner: request.user._id,
    message: sanitizeString(request.body.message),
    taskId: sanitizeString(request.body.taskId),
    status: request.body.status === "read" ? "read" : "unread",
    selected: Boolean(request.body.selected),
  });

  response.status(201).json({
    status: "success",
    notification: buildNotificationResponse(notification),
  });
});

export const updateNotification = asyncHandler(async (request, response) => {
  const notification = await getOwnedNotification(request);

  if (request.body.status !== undefined) {
    notification.status = request.body.status === "read" ? "read" : "unread";
  }

  if (request.body.read !== undefined) {
    notification.status = request.body.read ? "read" : "unread";
  }

  if (request.body.selected !== undefined) {
    notification.selected = Boolean(request.body.selected);
  }

  await notification.save();

  response.status(200).json({
    status: "success",
    notification: buildNotificationResponse(notification),
  });
});

export const markAllRead = asyncHandler(async (request, response) => {
  await Notification.updateMany({ owner: request.user._id }, { status: "read" });
  const notifications = await Notification.find({ owner: request.user._id }).sort({ createdAt: -1 });

  response.status(200).json({
    status: "success",
    notifications: notifications.map(buildNotificationResponse),
  });
});

export const selectRead = asyncHandler(async (request, response) => {
  await Notification.updateMany({ owner: request.user._id }, { selected: false });
  await Notification.updateMany({ owner: request.user._id, status: "read" }, { selected: true });

  const notifications = await Notification.find({ owner: request.user._id }).sort({ createdAt: -1 });

  response.status(200).json({
    status: "success",
    notifications: notifications.map(buildNotificationResponse),
  });
});

export const deleteSelected = asyncHandler(async (request, response) => {
  await Notification.deleteMany({ owner: request.user._id, selected: true });
  const notifications = await Notification.find({ owner: request.user._id }).sort({ createdAt: -1 });

  response.status(200).json({
    status: "success",
    notifications: notifications.map(buildNotificationResponse),
  });
});

export const deleteRead = asyncHandler(async (request, response) => {
  await Notification.deleteMany({ owner: request.user._id, status: "read" });
  const notifications = await Notification.find({ owner: request.user._id }).sort({ createdAt: -1 });

  response.status(200).json({
    status: "success",
    notifications: notifications.map(buildNotificationResponse),
  });
});
