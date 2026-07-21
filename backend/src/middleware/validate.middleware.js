import { ApiError } from "../utils/ApiError.js";
import { CLIENT_STATUSES } from "../constants/clientStatuses.js";
import { TASK_STATUSES } from "../constants/taskStatuses.js";

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

export const validateClient = (request, response, next) => {
  const { name, company, email, phone, status, dealValue } = request.body;
  const isCreateRequest = request.method === "POST";

  if ((isCreateRequest || name !== undefined) && String(name || "").trim().length < 3) {
    throw new ApiError(400, "Client name must contain at least 3 characters.");
  }

  if ((isCreateRequest || company !== undefined) && !String(company || "").trim()) {
    throw new ApiError(400, "Company is required.");
  }

  if ((isCreateRequest || email !== undefined) && !emailPattern.test(String(email || "").trim())) {
    throw new ApiError(400, "Client email must be valid and end with .com, .net, or .org.");
  }

  if (phone !== undefined && String(phone).trim() && String(phone).trim().length < 6) {
    throw new ApiError(400, "Phone number looks too short.");
  }

  if (status !== undefined && !CLIENT_STATUSES.includes(status)) {
    throw new ApiError(400, "Client status must be lead, contacted, won, or lost.");
  }

  if (dealValue !== undefined) {
    const parsedValue = Number(dealValue);

    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      throw new ApiError(400, "Deal value must be a positive number.");
    }
  }

  next();
};

export const validateTask = (request, response, next) => {
  const { title, client, dueAt, priority, status } = request.body;
  const isCreateRequest = request.method === "POST";

  if ((isCreateRequest || title !== undefined) && !String(title || "").trim()) {
    throw new ApiError(400, "Task title is required.");
  }

  if ((isCreateRequest || client !== undefined) && !String(client || "").trim()) {
    throw new ApiError(400, "Client name is required.");
  }

  if (dueAt !== undefined && dueAt && Number.isNaN(new Date(dueAt).getTime())) {
    throw new ApiError(400, "Task deadline must be a valid date.");
  }

  if (priority !== undefined && !["High", "Medium", "Low"].includes(priority)) {
    throw new ApiError(400, "Priority must be High, Medium, or Low.");
  }

  if (status !== undefined && !TASK_STATUSES.includes(status)) {
    throw new ApiError(400, "Task status must be todo, in-progress, overdue, or done.");
  }

  next();
};
