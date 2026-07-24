"use strict";

/* --- CRM API Layer --- */
(function initCrmData() {
  /* --- API constants define backend endpoints and fallback status helpers. --- */
  const constants = window.crmConstants;
  const storage = window.crmStorage;
  const API_URL = constants?.API_BASE_URL || "http://localhost:5000/api";
  const statuses = ["lead", "contacted", "won", "lost"];
  const DEFAULT_TIMEOUT_MS = 20000;
  const AUTH_TIMEOUT_MS = 45000;

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

    const controller = new AbortController();
    const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
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
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("The server is taking longer than expected. Please try again in a few seconds.");
      }

      if (error instanceof TypeError) {
        throw new Error("Backend is not reachable. Start the backend server or check the production API URL.");
      }

      throw error;
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  const authRequest = async (endpoint, body) => {
    return requestJson(endpoint, {
      method: "POST",
      requireAuth: false,
      timeoutMs: AUTH_TIMEOUT_MS,
      body: JSON.stringify(body),
    });
  };

  const warmBackend = () => {
    return requestJson("/health", {
      requireAuth: false,
      timeoutMs: 12000,
    }).catch(() => null);
  };

  const deleteAccountRequest = async (password) => {
    return requestJson("/auth/me", {
      method: "DELETE",
      body: JSON.stringify({ password }),
    });
  };

  const changePasswordRequest = async ({ currentPassword, newPassword, confirmPassword }) => {
    return requestJson("/auth/password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
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

  /* --- API Data Mapping and count limit --- */
  const STARTER_CLIENT_LIMIT = 30;

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

  const fetchDemoClients = async () => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(`https://dummyjson.com/users?limit=${STARTER_CLIENT_LIMIT}`, {
        signal: controller.signal,
      });
      const data = await response.json();
      return (data.users || []).slice(0, STARTER_CLIENT_LIMIT).map(mapApiUserToClient);
    } catch (error) {
      return Array.from({ length: STARTER_CLIENT_LIMIT }, (_, index) =>
        mapApiUserToClient(
          {
            id: `starter-${index + 1}`,
            firstName: `Starter`,
            lastName: `Client ${index + 1}`,
            email: `starter.client${index + 1}@example.com`,
            phone: `+995555${String(index + 1).padStart(4, "0")}`,
            company: { name: `Demo Company ${index + 1}` },
          },
          index,
        ),
      );
    } finally {
      window.clearTimeout(timeoutId);
    }
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

  /* --- Team API Requests --- */
  const fetchTeam = async () => {
    const data = await requestJson("/team");
    return data;
  };

  const postTeamMember = async (member) => {
    const data = await requestJson("/team/members", {
      method: "POST",
      body: JSON.stringify(member),
    });

    return data.member;
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

  const startPhoneCall = async (phoneNumber) => {
    const data = await requestJson("/phone/call", {
      method: "POST",
      timeoutMs: 30000,
      body: JSON.stringify({ to: phoneNumber }),
    });

    return data.call;
  };

  window.crmData = {
    hasApiSession,
    warmBackend,
    authRequest,
    deleteAccountRequest,
    changePasswordRequest,
    fetchInitialClients,
    fetchDemoClients,
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
    fetchTeam,
    postTeamMember,
    fetchPhoneSettings,
    updatePhoneSettings,
    startPhoneCall,
    getInitials,
    formatStatus,
  };

  warmBackend();
})();
