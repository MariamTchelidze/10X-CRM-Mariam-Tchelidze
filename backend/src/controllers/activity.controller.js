import { Activity } from "../models/Activity.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sanitizeString } from "../utils/sanitize.js";

const ACTIVITY_LIMIT = 80;

const normalizeDetails = (details = []) => {
  if (!Array.isArray(details)) return [];

  return details
    .map((detail) => {
      if (Array.isArray(detail)) {
        return {
          label: sanitizeString(detail[0]),
          value: sanitizeString(detail[1]),
        };
      }

      return {
        label: sanitizeString(detail.label),
        value: sanitizeString(detail.value),
      };
    })
    .filter((detail) => detail.label || detail.value);
};

const buildActivityResponse = (activity) => ({
  id: activity._id.toString(),
  type: activity.type,
  icon: activity.icon,
  title: activity.title,
  summary: activity.summary,
  status: activity.status,
  relatedLabel: activity.relatedLabel,
  description: activity.description,
  details: activity.details.map((detail) => [detail.label, detail.value]),
  actionHref: activity.actionHref,
  actionLabel: activity.actionLabel,
  createdAt: activity.createdAt,
  updatedAt: activity.updatedAt,
});

export const getActivity = asyncHandler(async (request, response) => {
  const activities = await Activity.find({ owner: request.user._id })
    .sort({ createdAt: -1 })
    .limit(ACTIVITY_LIMIT);

  response.status(200).json({
    status: "success",
    results: activities.length,
    activities: activities.map(buildActivityResponse),
  });
});

export const createActivity = asyncHandler(async (request, response) => {
  const activity = await Activity.create({
    owner: request.user._id,
    type: sanitizeString(request.body.type) || "general",
    icon: sanitizeString(request.body.icon) || "clock",
    title: sanitizeString(request.body.title) || "CRM activity",
    summary: sanitizeString(request.body.summary) || "Account activity was recorded.",
    status: sanitizeString(request.body.status) || "Updated",
    relatedLabel: sanitizeString(request.body.relatedLabel) || "CRM",
    description: sanitizeString(request.body.description) || sanitizeString(request.body.summary) || "Account activity was recorded.",
    details: normalizeDetails(request.body.details),
    actionHref: sanitizeString(request.body.actionHref) || "./dashboard.html#activity",
    actionLabel: sanitizeString(request.body.actionLabel) || "Open Activity",
  });

  response.status(201).json({
    status: "success",
    activity: buildActivityResponse(activity),
  });
});

export const clearActivity = asyncHandler(async (request, response) => {
  await Activity.deleteMany({ owner: request.user._id });

  response.status(200).json({
    status: "success",
    activities: [],
  });
});
