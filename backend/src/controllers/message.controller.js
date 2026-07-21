import { Message } from "../models/Message.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sanitizeString } from "../utils/sanitize.js";

const buildMessageResponse = (message) => ({
  id: message._id.toString(),
  conversation: message.conversation,
  role: message.role,
  author: message.author,
  recipient: message.recipient,
  text: message.text,
  createdAt: message.createdAt,
  updatedAt: message.updatedAt,
});

const buildConversationMap = (messages) => {
  return messages.reduce((conversations, message) => {
    const item = buildMessageResponse(message);
    const key = item.conversation || item.recipient;

    conversations[key] = [...(conversations[key] || []), item];
    return conversations;
  }, {});
};

export const getMessages = asyncHandler(async (request, response) => {
  const messages = await Message.find({ owner: request.user._id }).sort({ createdAt: 1 });

  response.status(200).json({
    status: "success",
    results: messages.length,
    conversations: buildConversationMap(messages),
  });
});

export const createMessage = asyncHandler(async (request, response) => {
  const recipient = sanitizeString(request.body.recipient);
  const text = sanitizeString(request.body.text);

  if (!recipient) {
    throw new ApiError(400, "Recipient is required.");
  }

  if (!text) {
    throw new ApiError(400, "Message text is required.");
  }

  const message = await Message.create({
    owner: request.user._id,
    conversation: sanitizeString(request.body.conversation) || recipient,
    role: request.body.role === "teammate" || request.body.role === "system" ? request.body.role : "user",
    author: sanitizeString(request.body.author) || "You",
    recipient,
    text,
  });

  response.status(201).json({
    status: "success",
    message: buildMessageResponse(message),
  });
});

export const clearConversation = asyncHandler(async (request, response) => {
  const conversation = sanitizeString(decodeURIComponent(request.params.conversation || ""));

  if (!conversation) {
    throw new ApiError(400, "Conversation is required.");
  }

  await Message.deleteMany({
    owner: request.user._id,
    conversation,
  });

  const messages = await Message.find({ owner: request.user._id }).sort({ createdAt: 1 });

  response.status(200).json({
    status: "success",
    conversations: buildConversationMap(messages),
  });
});

export const clearAllMessages = asyncHandler(async (request, response) => {
  await Message.deleteMany({ owner: request.user._id });

  response.status(200).json({
    status: "success",
    conversations: {},
  });
});
