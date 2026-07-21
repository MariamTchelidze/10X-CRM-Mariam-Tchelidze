import { User } from "../models/User.js";
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
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const user = await User.create({
    fullName: sanitizeString(request.body.fullName),
    company: sanitizeString(request.body.company),
    email,
    password: await hashPassword(request.body.password),
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
