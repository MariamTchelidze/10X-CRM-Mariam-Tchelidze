"use strict";

/* --- CRM API Layer --- */
(function initCrmData() {
  /* --- API constants define backend endpoints and fallback status helpers. --- */
  const constants = window.crmConstants;
  const storage = window.crmStorage;
  const API_URL = constants?.API_BASE_URL || "http://localhost:5000/api";
  const statuses = ["lead", "contacted", "won", "lost"];

  /* --- Adds response status to errors so UI can show better feedback. --- */
  const createApiError = (message, response) => {
    const error = new Error(message);
    error.status = response.status;
    return error;
  };

  /* --- Auth helpers attach the saved backend token to protected API requests. --- */
  const getSession = () => storage?.read(constants?.SESSION_KEY, null) || null;

  const getAuthHeaders = () => {
    const token = getSession()?.token;

    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const hasApiSession = () => Boolean(getSession()?.token);

  const requestJson = async (endpoint, options = {}) => {
    if (options.requireAuth !== false && !hasApiSession()) {
      throw new Error("Login is required before calling this API.");
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    const payload = response.status === 204 ? null : await response.json().catch(() => null);

    if (!response.ok) {
      throw createApiError(payload?.message || "Request failed.", response);
    }

    return payload;
  };

  const authRequest = async (endpoint, body) => {
    return requestJson(endpoint, {
      method: "POST",
      requireAuth: false,
      body: JSON.stringify(body),
    });
  };

  /* --- Small display helpers keep API cards readable. --- */
  const getInitials = (name = "") =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");

  const formatStatus = (status = "lead") => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  /* --- API Data Mapping --- */
  const mapApiUserToClient = (user, index = 0) => {
    const status = statuses[index % statuses.length];
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Unnamed Client";

    return {
      id: user.id,
      name,
      email: user.email || "",
      phone: user.phone || "",
      company: user.company?.name || "Unknown Company",
      image: user.image || "",
      status,
      dealValue: 2500 + index * 750,
      notes: [],
      createdAt: new Date(Date.now() - index * 86400000).toISOString(),
    };
  };

  /* --- Client API Requests --- */
  const fetchInitialClients = async () => {
    const data = await requestJson("/clients");
    return data.clients || [];
  };

  /* --- POST creates a client in MongoDB for the active account. --- */
  const postClient = async (client) => {
    const data = await requestJson("/clients", {
      method: "POST",
      body: JSON.stringify(client),
    });

    return data.client;
  };

  /* --- PATCH updates the selected MongoDB client. --- */
  const updateClientRequest = async (clientId, client) => {
    const data = await requestJson(`/clients/${clientId}`, {
      method: "PATCH",
      body: JSON.stringify(client),
    });

    return data.client;
  };

  /* --- DELETE removes the selected MongoDB client. --- */
  const deleteClientRequest = async (clientId) => {
    return requestJson(`/clients/${clientId}`, { method: "DELETE" });
  };

  /* --- Task API Requests --- */
  const fetchTasks = async () => {
    const data = await requestJson("/tasks");
    return data.tasks || [];
  };

  const postTask = async (task) => {
    const data = await requestJson("/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    });

    return data.task;
  };

  const updateTaskRequest = async (taskId, task) => {
    const data = await requestJson(`/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(task),
    });

    return data.task;
  };

  const deleteTaskRequest = async (taskId) => {
    return requestJson(`/tasks/${taskId}`, { method: "DELETE" });
  };

  /* --- Notification API Requests --- */
  const fetchNotifications = async () => {
    const data = await requestJson("/notifications");
    return data.notifications || [];
  };

  const postNotification = async (notification) => {
    const data = await requestJson("/notifications", {
      method: "POST",
      body: JSON.stringify(notification),
    });

    return data.notification;
  };

  const updateNotificationRequest = async (notificationId, notification) => {
    const data = await requestJson(`/notifications/${notificationId}`, {
      method: "PATCH",
      body: JSON.stringify(notification),
    });

    return data.notification;
  };

  const markAllNotificationsRead = async () => {
    const data = await requestJson("/notifications/mark-all-read", { method: "PATCH" });
    return data.notifications || [];
  };

  const selectReadNotifications = async () => {
    const data = await requestJson("/notifications/select-read", { method: "PATCH" });
    return data.notifications || [];
  };

  const deleteSelectedNotifications = async () => {
    const data = await requestJson("/notifications/selected", { method: "DELETE" });
    return data.notifications || [];
  };

  const deleteReadNotifications = async () => {
    const data = await requestJson("/notifications/read", { method: "DELETE" });
    return data.notifications || [];
  };

  /* --- Activity API Requests --- */
  const fetchActivity = async () => {
    const data = await requestJson("/activity");
    return data.activities || [];
  };

  const postActivity = async (activity) => {
    const data = await requestJson("/activity", {
      method: "POST",
      body: JSON.stringify(activity),
    });

    return data.activity;
  };

  const clearActivityRequest = async () => {
    const data = await requestJson("/activity", { method: "DELETE" });
    return data.activities || [];
  };

  /* --- Messenger API Requests --- */
  const fetchMessages = async () => {
    const data = await requestJson("/messages");
    return data.conversations || {};
  };

  const postMessage = async (message) => {
    const data = await requestJson("/messages", {
      method: "POST",
      body: JSON.stringify(message),
    });

    return data.message;
  };

  const clearMessageConversation = async (conversation) => {
    const data = await requestJson(`/messages/${encodeURIComponent(conversation)}`, {
      method: "DELETE",
    });

    return data.conversations || {};
  };

  const clearAllMessages = async () => {
    const data = await requestJson("/messages", { method: "DELETE" });
    return data.conversations || {};
  };

  /* --- Phone Settings API Requests --- */
  const fetchPhoneSettings = async () => {
    const data = await requestJson("/settings/phone");
    return data.settings;
  };

  const updatePhoneSettings = async (settings) => {
    const data = await requestJson("/settings/phone", {
      method: "PATCH",
      body: JSON.stringify(settings),
    });

    return data.settings;
  };

  window.crmData = {
    hasApiSession,
    authRequest,
    fetchInitialClients,
    postClient,
    updateClientRequest,
    deleteClientRequest,
    fetchTasks,
    postTask,
    updateTaskRequest,
    deleteTaskRequest,
    fetchNotifications,
    postNotification,
    updateNotificationRequest,
    markAllNotificationsRead,
    selectReadNotifications,
    deleteSelectedNotifications,
    deleteReadNotifications,
    fetchActivity,
    postActivity,
    clearActivityRequest,
    fetchMessages,
    postMessage,
    clearMessageConversation,
    clearAllMessages,
    fetchPhoneSettings,
    updatePhoneSettings,
    getInitials,
    formatStatus,
  };
})();
