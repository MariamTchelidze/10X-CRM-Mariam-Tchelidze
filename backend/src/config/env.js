import dotenv from "dotenv";

dotenv.config();

const parsePort = (value) => {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 ? port : 5000;
};

export const env = {
  port: parsePort(process.env.PORT),
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://127.0.0.1:5500,http://localhost:5500",
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || "",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || "",
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || "",
  isDevelopment: (process.env.NODE_ENV || "development") === "development",
};
