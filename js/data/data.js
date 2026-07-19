"use strict";

(function initCrmData() {
  const API_URL = "https://dummyjson.com/users";
  const statuses = ["lead", "contacted", "won", "lost"];

  const createApiError = (message, response) => {
    const error = new Error(message);
    error.status = response.status;
    return error;
  };

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

  const fetchInitialClients = async () => {
    const response = await fetch(`${API_URL}?limit=30`);

    if (!response.ok) {
      throw createApiError("Clients could not be loaded.", response);
    }

    const data = await response.json();
    return (data.users || []).map(mapApiUserToClient);
  };

  const postClient = async (client) => {
    const response = await fetch(`${API_URL}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: client.name,
        email: client.email,
        phone: client.phone,
        company: { name: client.company },
      }),
    });

    if (!response.ok) {
      throw createApiError("Client could not be added.", response);
    }

    return response.json();
  };

  const updateClientRequest = async (clientId, client) => {
    const response = await fetch(`${API_URL}/${clientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: client.name,
        email: client.email,
        phone: client.phone,
        company: { name: client.company },
      }),
    });

    if (!response.ok && response.status !== 404) {
      throw createApiError("Client could not be updated.", response);
    }

    return response.status === 404 ? {} : response.json();
  };

  const deleteClientRequest = async (clientId) => {
    const response = await fetch(`${API_URL}/${clientId}`, { method: "DELETE" });

    if (!response.ok && response.status !== 404) {
      throw createApiError("Client could not be deleted.", response);
    }
  };

  window.crmData = {
    fetchInitialClients,
    postClient,
    updateClientRequest,
    deleteClientRequest,
    getInitials,
    formatStatus,
  };
})();
