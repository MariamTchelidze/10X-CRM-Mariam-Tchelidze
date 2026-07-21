import { env } from "../config/env.js";

export const notFound = (request, response, next) => {
  const error = new Error(`Route not found: ${request.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, request, response, next) => {
  const statusCode = error.statusCode || 500;

  response.status(statusCode).json({
    status: `${statusCode}`.startsWith("4") ? "fail" : "error",
    message: error.message || "Something went wrong.",
    ...(env.isDevelopment ? { stack: error.stack } : {}),
  });
};
