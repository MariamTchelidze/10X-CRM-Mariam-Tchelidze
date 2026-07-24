import mongoose from "mongoose";
import { env } from "./env.js";

const connectionStates = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

export const getDatabaseStatus = () => {
  return connectionStates[mongoose.connection.readyState] || "unknown";
};

export const connectDatabase = async () => {
  if (!env.mongoUri) {
    throw new Error("MONGO_URI is missing. Add it to backend/.env before starting the server.");
  }

  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected.");
  });

  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected.");
  });

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error.message);
  });

  await mongoose.connect(env.mongoUri, {
    dbName: "10x-crm",
    serverSelectionTimeoutMS: 10000,
  });
};
