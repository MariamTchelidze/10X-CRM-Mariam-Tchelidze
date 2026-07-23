import dotenv from "dotenv";

dotenv.config();

const parsePort = (value) => {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 ? port : 5000;
};

const cleanEnvValue = (value = "") => {
  return String(value).trim().replace(/^["']|["']$/g, "");
};

const cleanMongoUri = (value = "") => {
  return cleanEnvValue(value).replace(/^MONGO_URI=/i, "").trim();
};

export const env = {
  port: parsePort(cleanEnvValue(process.env.PORT)),
  nodeEnv: cleanEnvValue(process.env.NODE_ENV) || "development",
  mongoUri: cleanMongoUri(process.env.MONGO_URI),
  jwtSecret: cleanEnvValue(process.env.JWT_SECRET),
  jwtExpiresIn: cleanEnvValue(process.env.JWT_EXPIRES_IN) || "7d",
  clientUrl: cleanEnvValue(process.env.CLIENT_URL) || "http://127.0.0.1:5500,http://localhost:5500",
  twilioAccountSid: cleanEnvValue(process.env.TWILIO_ACCOUNT_SID),
  twilioAuthToken: cleanEnvValue(process.env.TWILIO_AUTH_TOKEN),
  twilioPhoneNumber: cleanEnvValue(process.env.TWILIO_PHONE_NUMBER),
  allowedCallNumber: cleanEnvValue(process.env.ALLOWED_CALL_NUMBER) || "+995551128078",
  isDevelopment: (cleanEnvValue(process.env.NODE_ENV) || "development") === "development",
};
