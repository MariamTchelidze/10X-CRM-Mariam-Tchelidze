import { Setting } from "../models/Setting.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sanitizeString } from "../utils/sanitize.js";

const phonePattern = /^\+[1-9]\d{7,14}$/;

const getWorkspaceKey = (user) => {
  const company = sanitizeString(user.company).toLowerCase();

  if (company) {
    return company.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  return String(user.email || "").split("@")[1]?.toLowerCase() || user._id.toString();
};

const canManagePhoneSettings = (user) => ["owner", "admin"].includes(user.role);

const getOrCreateWorkspaceSettings = async (user) => {
  const workspaceKey = getWorkspaceKey(user);
  const existingSettings = await Setting.findOne({ workspaceKey });

  if (existingSettings) {
    return existingSettings;
  }

  return Setting.create({
    workspaceKey,
    companyName: sanitizeString(user.company),
    owner: user._id,
    phone: {},
  });
};

const buildPhoneSettingsResponse = (settings, user) => ({
  workspaceKey: settings.workspaceKey,
  companyName: settings.companyName,
  canManage: canManagePhoneSettings(user),
  phone: {
    companyPhoneNumber: settings.phone.companyPhoneNumber,
    callingEnabled: settings.phone.callingEnabled,
    callerIdStatus: settings.phone.callerIdStatus,
  },
});

export const getPhoneSettings = asyncHandler(async (request, response) => {
  const settings = await getOrCreateWorkspaceSettings(request.user);

  response.status(200).json({
    status: "success",
    settings: buildPhoneSettingsResponse(settings, request.user),
  });
});

export const updatePhoneSettings = asyncHandler(async (request, response) => {
  if (!canManagePhoneSettings(request.user)) {
    throw new ApiError(403, "Only the workspace owner or admin can manage the company phone number.");
  }

  const settings = await getOrCreateWorkspaceSettings(request.user);
  const nextPhoneNumber = sanitizeString(request.body.companyPhoneNumber);

  if (nextPhoneNumber && !phonePattern.test(nextPhoneNumber)) {
    throw new ApiError(400, "Company phone number must use E.164 format, for example +995574431557.");
  }

  if (request.body.companyPhoneNumber !== undefined) {
    settings.phone.companyPhoneNumber = nextPhoneNumber;
    settings.phone.callerIdStatus = nextPhoneNumber ? "not_configured" : "not_configured";
    settings.phone.twilioCallerIdSid = "";
  }

  if (request.body.callingEnabled !== undefined) {
    settings.phone.callingEnabled = Boolean(request.body.callingEnabled);
  }

  if (request.body.callerIdStatus !== undefined) {
    const allowedStatuses = ["not_configured", "pending_verification", "verified"];

    if (!allowedStatuses.includes(request.body.callerIdStatus)) {
      throw new ApiError(400, "Caller ID status is invalid.");
    }

    settings.phone.callerIdStatus = request.body.callerIdStatus;
  }

  await settings.save();

  response.status(200).json({
    status: "success",
    settings: buildPhoneSettingsResponse(settings, request.user),
  });
});
