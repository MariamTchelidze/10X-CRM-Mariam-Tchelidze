import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";
import { getDatabaseStatus } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";

const app = express();

const allowedOrigins = [
  env.clientUrl,
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("This origin is not allowed by CORS."));
    },
    credentials: true,
  }),
);

if (env.isDevelopment) {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/api/health", (request, response) => {
  response.status(200).json({
    status: "success",
    message: "10X CRM backend is running.",
    environment: env.nodeEnv,
    database: getDatabaseStatus(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;
