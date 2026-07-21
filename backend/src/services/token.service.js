import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const getJwtSecret = () => {
  if (!env.jwtSecret) {
    throw new ApiError(500, "JWT_SECRET is missing. Add it to backend/.env.");
  }

  return env.jwtSecret;
};

export const createAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    getJwtSecret(),
    {
      expiresIn: env.jwtExpiresIn,
    },
  );
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (error) {
    throw new ApiError(401, "Your session is invalid or expired. Please log in again.");
  }
};
