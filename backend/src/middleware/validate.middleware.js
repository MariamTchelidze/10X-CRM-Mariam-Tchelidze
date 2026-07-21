import { ApiError } from "../utils/ApiError.js";

const emailPattern = /^\S+@\S+\.(com|net|org)$/i;
const latinPasswordPattern = /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/;

export const validateSignup = (request, response, next) => {
  const { fullName, email, password, confirmPassword } = request.body;

  if (!fullName || String(fullName).trim().length < 2) {
    throw new ApiError(400, "Full name must contain at least 2 characters.");
  }

  if (!emailPattern.test(String(email || "").trim())) {
    throw new ApiError(400, "Email must be valid and end with .com, .net, or .org.");
  }

  if (!password || String(password).length < 8) {
    throw new ApiError(400, "Password must contain at least 8 characters.");
  }

  if (!latinPasswordPattern.test(String(password))) {
    throw new ApiError(400, "Password can contain only Latin letters, numbers, and common symbols.");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match.");
  }

  next();
};

export const validateLogin = (request, response, next) => {
  const { email, password } = request.body;

  if (!emailPattern.test(String(email || "").trim())) {
    throw new ApiError(400, "Enter a valid email ending with .com, .net, or .org.");
  }

  if (!password) {
    throw new ApiError(400, "Password is required.");
  }

  next();
};
