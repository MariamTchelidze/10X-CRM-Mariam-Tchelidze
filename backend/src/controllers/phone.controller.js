import twilio from "twilio";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sanitizeString } from "../utils/sanitize.js";

const phonePattern = /^\+[1-9]\d{7,14}$/;

const normalizePhoneNumber = (value = "") => {
  const text = sanitizeString(value);
  const prefix = text.startsWith("+") ? "+" : "";
  return `${prefix}${text.replace(/[^0-9]/g, "")}`;
};

const getTwilioClient = () => {
  if (!env.twilioAccountSid || !env.twilioAuthToken || !env.twilioPhoneNumber) {
    throw new ApiError(503, "Twilio calling is not configured yet.");
  }

  return twilio(env.twilioAccountSid, env.twilioAuthToken);
};

export const startPhoneCall = asyncHandler(async (request, response) => {
  const to = normalizePhoneNumber(request.body.to);
  const allowedNumber = normalizePhoneNumber(env.allowedCallNumber);

  if (!phonePattern.test(to)) {
    throw new ApiError(400, "Phone number must use E.164 format, for example +995574431557.");
  }

  if (allowedNumber && to !== allowedNumber) {
    throw new ApiError(403, "Calling is available only for the configured exam test number.");
  }

  const client = getTwilioClient();
  const call = await client.calls.create({
    to,
    from: env.twilioPhoneNumber,
    twiml: `
      <Response>
        <Say voice="alice">
          This is a test call from 10X CRM. Twilio integration is active.
        </Say>
      </Response>
    `,
  });

  response.status(201).json({
    status: "success",
    message: "CRM phone call started through Twilio.",
    call: {
      id: call.sid,
      to,
      from: env.twilioPhoneNumber,
      twilioStatus: call.status,
    },
  });
});
