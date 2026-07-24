import { User } from "../models/User.js";
import { Activity } from "../models/Activity.js";
import { Client } from "../models/Client.js";
import { Message } from "../models/Message.js";
import { Notification } from "../models/Notification.js";
import { Setting } from "../models/Setting.js";
import { Task } from "../models/Task.js";
import { TeamMember } from "../models/TeamMember.js";
import { hashPassword, comparePasswords } from "../services/auth.service.js";
import { createAccessToken } from "../services/token.service.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sanitizeString } from "../utils/sanitize.js";

const buildUserResponse = (user) => ({
  id: user._id.toString(),
  fullName: user.fullName,
  company: user.company,
  email: user.email,
  role: user.role,
  bio: user.bio,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const sendAuthResponse = (response, statusCode, user) => {
  const token = createAccessToken(user);

  response.status(statusCode).json({
    status: "success",
    token,
    user: buildUserResponse(user),
  });
};

export const signup = asyncHandler(async (request, response) => {
  const email = sanitizeString(request.body.email).toLowerCase();
  const company = sanitizeString(request.body.company);
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const companyUserExists = company
    ? await User.exists({ company: { $regex: `^${company.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } })
    : await User.exists({});

  const user = await User.create({
    fullName: sanitizeString(request.body.fullName),
    company,
    email,
    password: await hashPassword(request.body.password),
    role: companyUserExists ? "user" : "owner",
  });

  sendAuthResponse(response, 201, user);
});

export const login = asyncHandler(async (request, response) => {
  const email = sanitizeString(request.body.email).toLowerCase();
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const passwordIsCorrect = await comparePasswords(request.body.password, user.password);

  if (!passwordIsCorrect) {
    throw new ApiError(401, "Invalid email or password.");
  }

  sendAuthResponse(response, 200, user);
});

export const getMe = asyncHandler(async (request, response) => {
  response.status(200).json({
    status: "success",
    user: buildUserResponse(request.user),
  });
});

export const changePassword = asyncHandler(async (request, response) => {
  const { currentPassword, newPassword } = request.body;
  const user = await User.findById(request.user._id).select("+password");

  if (!user) {
    throw new ApiError(401, "The user connected to this session no longer exists.");
  }

  const passwordIsCorrect = await comparePasswords(currentPassword, user.password);

  if (!passwordIsCorrect) {
    throw new ApiError(401, "Current password is incorrect.");
  }

  user.password = await hashPassword(newPassword);
  await user.save();

  response.status(200).json({
    status: "success",
    message: "Password changed successfully.",
  });
});

export const deleteAccount = asyncHandler(async (request, response) => {
  const password = request.body.password;
  const user = await User.findById(request.user._id).select("+password");

  if (!user) {
    throw new ApiError(401, "The user connected to this session no longer exists.");
  }

  const passwordIsCorrect = await comparePasswords(password, user.password);

  if (!passwordIsCorrect) {
    throw new ApiError(401, "Password does not match this account.");
  }

  await Promise.all([
    Client.deleteMany({ owner: user._id }),
    Task.deleteMany({ owner: user._id }),
    Notification.deleteMany({ owner: user._id }),
    Activity.deleteMany({ owner: user._id }),
    Message.deleteMany({ owner: user._id }),
    Setting.deleteMany({ owner: user._id }),
    TeamMember.deleteMany({ owner: user._id }),
  ]);

  await user.deleteOne();

  response.status(200).json({
    status: "success",
    message: "Account deleted successfully.",
  });
});
