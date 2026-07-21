import mongoose from "mongoose";
import { Client } from "../models/Client.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sanitizeString } from "../utils/sanitize.js";

const allowedSorts = {
  "created-desc": { createdAt: -1 },
  "created-asc": { createdAt: 1 },
  "value-desc": { dealValue: -1 },
  "value-asc": { dealValue: 1 },
  "name-asc": { name: 1 },
};

const buildClientResponse = (client) => ({
  id: client._id.toString(),
  name: client.name,
  company: client.company,
  email: client.email,
  phone: client.phone,
  country: client.country,
  timezone: client.timezone,
  status: client.status,
  dealValue: client.dealValue,
  notes: client.notes,
  reminderAt: client.reminderAt,
  reminderNotified: client.reminderNotified,
  createdAt: client.createdAt,
  updatedAt: client.updatedAt,
});

const getOwnedClient = async (request) => {
  if (!mongoose.isValidObjectId(request.params.clientId)) {
    throw new ApiError(400, "Invalid client id.");
  }

  const client = await Client.findOne({
    _id: request.params.clientId,
    owner: request.user._id,
  });

  if (!client) {
    throw new ApiError(404, "Client was not found.");
  }

  return client;
};

const buildClientPayload = (body) => {
  const payload = {};

  if (body.name !== undefined) payload.name = sanitizeString(body.name);
  if (body.company !== undefined) payload.company = sanitizeString(body.company);
  if (body.email !== undefined) payload.email = sanitizeString(body.email).toLowerCase();
  if (body.phone !== undefined) payload.phone = sanitizeString(body.phone);
  if (body.country !== undefined) payload.country = sanitizeString(body.country);
  if (body.timezone !== undefined) payload.timezone = sanitizeString(body.timezone);
  if (body.status !== undefined) payload.status = body.status;
  if (body.dealValue !== undefined) payload.dealValue = Number(body.dealValue);
  if (body.reminderAt !== undefined) payload.reminderAt = body.reminderAt || null;
  if (body.reminderNotified !== undefined) payload.reminderNotified = Boolean(body.reminderNotified);
  if (Array.isArray(body.notes)) payload.notes = body.notes;

  return payload;
};

export const getClients = asyncHandler(async (request, response) => {
  const { search = "", status = "all", sort = "created-desc" } = request.query;
  const query = { owner: request.user._id };
  const searchValue = sanitizeString(search);

  if (status !== "all") {
    query.status = status;
  }

  if (searchValue) {
    query.$or = [
      { name: { $regex: searchValue, $options: "i" } },
      { company: { $regex: searchValue, $options: "i" } },
      { email: { $regex: searchValue, $options: "i" } },
      { phone: { $regex: searchValue, $options: "i" } },
    ];
  }

  const clients = await Client.find(query).sort(allowedSorts[sort] || allowedSorts["created-desc"]);

  response.status(200).json({
    status: "success",
    results: clients.length,
    clients: clients.map(buildClientResponse),
  });
});

export const createClient = asyncHandler(async (request, response) => {
  const existingClient = await Client.findOne({
    owner: request.user._id,
    email: sanitizeString(request.body.email).toLowerCase(),
  });

  if (existingClient) {
    throw new ApiError(409, "A client with this email already exists.");
  }

  const client = await Client.create({
    ...buildClientPayload(request.body),
    owner: request.user._id,
  });

  response.status(201).json({
    status: "success",
    client: buildClientResponse(client),
  });
});

export const getClient = asyncHandler(async (request, response) => {
  const client = await getOwnedClient(request);

  response.status(200).json({
    status: "success",
    client: buildClientResponse(client),
  });
});

export const updateClient = asyncHandler(async (request, response) => {
  const client = await getOwnedClient(request);
  const nextEmail = sanitizeString(request.body.email).toLowerCase();

  if (nextEmail && nextEmail !== client.email) {
    const emailOwner = await Client.findOne({
      owner: request.user._id,
      email: nextEmail,
      _id: { $ne: client._id },
    });

    if (emailOwner) {
      throw new ApiError(409, "A client with this email already exists.");
    }
  }

  Object.assign(client, buildClientPayload(request.body));
  await client.save();

  response.status(200).json({
    status: "success",
    client: buildClientResponse(client),
  });
});

export const deleteClient = asyncHandler(async (request, response) => {
  const client = await getOwnedClient(request);

  await client.deleteOne();

  response.status(200).json({
    status: "success",
    message: "Client deleted successfully.",
    clientId: request.params.clientId,
  });
});
