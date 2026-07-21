import { User } from "../models/User.js";
import { verifyAccessToken } from "../services/token.service.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getBearerToken = (authorizationHeader = "") => {
  if (!authorizationHeader.startsWith("Bearer ")) {
    return "";
  }

  return authorizationHeader.slice(7).trim();
};

export const protect = asyncHandler(async (request, response, next) => {
  const token = getBearerToken(request.headers.authorization);

  if (!token) {
    throw new ApiError(401, "You must be logged in to access this resource.");
  }

  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new ApiError(401, "The user connected to this session no longer exists.");
  }

  request.user = user;
  next();
});
