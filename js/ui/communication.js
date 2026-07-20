"use strict";

/* --- Messenger and 10X SensAI Controller --- */
(function initCommunicationModals() {
  const teamForm = document.querySelector(".js-communication-chat-form");
  const teamMessages = document.querySelector(".js-communication-chat-messages");
  const teamInput = document.querySelector(".js-communication-chat-input");
  const recipientSelect = document.querySelector(".js-communication-recipient");
  const aiForm = document.querySelector(".js-ai-chat-form");
  const aiMessages = document.querySelector(".js-ai-chat-messages");
  const aiInput = document.querySelector(".js-ai-chat-input");
  const sensaiAvatar = document.querySelector(".js-sensai-avatar");
  const sensaiSuggestions = document.querySelector(".js-sensai-suggestions");
  const clearTeamChatButton = document.querySelector(".js-clear-team-chat");
  const clearAiChatButton = document.querySelector(".js-clear-ai-chat");

  if (!teamForm && !aiForm) return;

  const TEAM_KEY = "crm_team_chat_history";
  const AI_KEY = "crm_sensai_chat_history";
  const LEGACY_AI_KEY = "crm_ai_chat_history";
  const TASKS_KEY = "crm_tasks";
  const NOTIFICATIONS_KEY = "crm_task_notifications";
  const FAVOURITES_KEY = "crm_favourites";

  const escapeHtml = (value) =>
    String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const readHistory = (key, fallback = []) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return Array.isArray(value) ? value : fallback;
    } catch (error) {
      return fallback;
    }
  };

  const saveHistory = (key, history) => {
    try {
      localStorage.setItem(key, JSON.stringify(history));
    } catch (error) {
      // Chat keeps rendering for this page if storage is unavailable.
    }
  };

  /* --- Local Storage Helpers --- */
  const readArray = (key) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  };

  const formatTime = (value) =>
    new Date(value).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  /* --- CRM Context for SensAI Replies --- */
  const getCrmContext = () => {
    const clients = readArray(window.crmConstants?.CLIENTS_KEY || "crm_clients");
    const tasks = readArray(TASKS_KEY);
    const notifications = readArray(NOTIFICATIONS_KEY);
    const favourites = readArray(FAVOURITES_KEY);
    const page = document.body.dataset.page || "crm";

    return {
      clients,
      tasks,
      notifications,
      favourites,
      page,
      wonClients: clients.filter((client) => client.status === "won"),
      lostClients: clients.filter((client) => client.status === "lost"),
      leads: clients.filter((client) => client.status === "lead"),
      overdueTasks: tasks.filter((task) => !task.deleted && !task.archived && task.status === "overdue"),
      openTasks: tasks.filter((task) => !task.deleted && !task.archived && task.status !== "done"),
      unreadNotifications: notifications.filter((item) => item.status !== "read" && !item.read),
    };
  };

  const getMoney = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  const setSensaiState = (state = "idle") => {
    if (!sensaiAvatar) return;

    sensaiAvatar.classList.remove("sensai-avatar--idle", "sensai-avatar--thinking", "sensai-avatar--speaking");
    sensaiAvatar.classList.add(`sensai-avatar--${state}`);
  };

  const getCsvDownloadHref = (content) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    return URL.createObjectURL(blob);
  };

  const renderAttachment = (attachment) => {
    if (!attachment || attachment.type !== "csv") return "";

    const href = getCsvDownloadHref(attachment.content);
    return `
      <div class="communication-message__attachment">
        <div>
          <strong>${escapeHtml(attachment.title)}</strong>
          <span>${escapeHtml(attachment.description)}</span>
        </div>
        <a class="btn btn--secondary communication-message__download" href="${href}" download="${escapeHtml(attachment.filename)}">
          Download CSV
        </a>
      </div>
    `;
  };

  const renderMessages = (container, history, emptyText) => {
    if (!container) return;

    if (!history.length) {
      container.innerHTML = `<p class="communication-message communication-message--system">${emptyText}</p>`;
      return;
    }

    container.innerHTML = history
      .map(
        (message) => `
          <article class="communication-message communication-message--${message.role}">
            <header>
              <strong>${escapeHtml(message.author)}</strong>
              <time>${formatTime(message.createdAt)}</time>
            </header>
            ${
              message.recipient
                ? `<span class="communication-message__recipient">To ${escapeHtml(message.recipient)}</span>`
                : ""
            }
            <p>${escapeHtml(message.text)}</p>
            ${renderAttachment(message.attachment)}
          </article>
        `,
      )
      .join("");
    container.scrollTop = container.scrollHeight;
  };

  const getSuggestions = () => {
    const page = document.body.dataset.page || "";
    const shared = ["Today's focus", "Show overdue tasks", "Export clients CSV", "Summarize clients", "Unread notifications"];

    if (page === "clients") return ["High-value leads", "Clients by country", "Follow-up reminders", ...shared];
    if (page === "profile") return ["My statistics", "What changed recently?", ...shared];
    if (page === "dashboard") return ["Summarize pipeline", "Show activity", ...shared];

    return shared;
  };

  const renderSuggestions = () => {
    if (!sensaiSuggestions) return;

    sensaiSuggestions.innerHTML = getSuggestions()
      .map((suggestion) => `<button class="sensai-suggestion js-sensai-suggestion" type="button">${escapeHtml(suggestion)}</button>`)
      .join("");
  };

  const summarizeClients = (context) => {
    const value = context.wonClients.reduce((sum, client) => sum + (Number(client.dealValue) || 0), 0);
    return `You have ${context.clients.length} clients: ${context.leads.length} leads, ${context.wonClients.length} won, and ${context.lostClients.length} lost. Won value is ${getMoney(value)}.`;
  };

  const getTodayFocus = (context) => {
    if (context.overdueTasks.length) {
      return `Focus first on ${context.overdueTasks.length} overdue task${context.overdueTasks.length === 1 ? "" : "s"}: ${context.overdueTasks
        .slice(0, 3)
        .map((task) => task.title)
        .join(", ")}.`;
    }

    if (context.leads.length) {
      const topLead = [...context.leads].sort((a, b) => (Number(b.dealValue) || 0) - (Number(a.dealValue) || 0))[0];
      return `No overdue tasks found. Your best focus is ${topLead.name || "a lead"} with ${getMoney(topLead.dealValue)} potential value.`;
    }

    return "No urgent tasks or leads found. A good next step is reviewing recent activity and keeping client notes updated.";
  };

  const getClientsByCountry = (context) => {
    const counts = context.clients.reduce((map, client) => {
      const label = client.country || client.timezone || "Unknown country";
      map[label] = (map[label] || 0) + 1;
      return map;
    }, {});
    const entries = Object.entries(counts);

    if (!entries.length) return "No clients are saved yet, so I cannot group countries.";
    return `Client countries: ${entries.map(([country, count]) => `${country}: ${count}`).join("; ")}.`;
  };

  const getProfileStats = (context) => {
    const closed = context.wonClients.length + context.lostClients.length;
    const kpi = closed ? Math.round((context.wonClients.length / closed) * 100) : 0;
    return `Private stats preview: ${context.leads.length} leads, ${context.wonClients.length} successful contracts, ${context.lostClients.length} failed contracts, KPI ${kpi}%.`;
  };

  const CLIENT_CSV_COLUMNS = [
    ["name", "Name"],
    ["company", "Company"],
    ["email", "Email"],
    ["phone", "Phone"],
    ["status", "Status"],
    ["dealValue", "Deal Value"],
    ["country", "Country"],
    ["timezone", "Timezone"],
  ];

  const CSV_STATUS_FILTERS = {
    lead: "Lead",
    leads: "Lead",
    won: "Won",
    lost: "Lost",
    contacted: "Contacted",
  };

  const escapeCsvCell = (value) => {
    const cell = String(value ?? "");
    return /[",\n\r]/.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell;
  };

  const getCsvRequest = (prompt) => {
    const text = prompt.toLowerCase();
    const asksForCsv = text.includes("csv") || text.includes("export") || text.includes("download");
    const asksForClients = text.includes("client") || text.includes("lead") || text.includes("won") || text.includes("lost");

    if (!asksForCsv || !asksForClients) return null;

    const statusKey = Object.keys(CSV_STATUS_FILTERS).find((key) => text.includes(key));
    const status = statusKey ? CSV_STATUS_FILTERS[statusKey].toLowerCase() : "all";

    return {
      status,
      label: status === "all" ? "all clients" : `${CSV_STATUS_FILTERS[statusKey]} clients`,
    };
  };

  const getClientField = (client, key) => {
    if (key === "dealValue") return Number(client.dealValue) || 0;
    return client[key] || "";
  };

  const createClientsCsvAttachment = (context, request) => {
    const clients =
      request.status === "all"
        ? context.clients
        : context.clients.filter((client) => String(client.status || "").toLowerCase() === request.status);

    const header = CLIENT_CSV_COLUMNS.map(([, label]) => escapeCsvCell(label)).join(",");
    const rows = clients.map((client) =>
      CLIENT_CSV_COLUMNS.map(([key]) => escapeCsvCell(getClientField(client, key))).join(","),
    );
    const csv = [header, ...rows].join("\n");
    const date = new Date().toISOString().slice(0, 10);
    const filename = `10x-crm-${request.status === "all" ? "clients" : `${request.status}-clients`}-${date}.csv`;

    return {
      clients,
      attachment: {
        type: "csv",
        title: `${request.label} CSV`,
        description: `${clients.length} record${clients.length === 1 ? "" : "s"} prepared from CRM client data.`,
        filename,
        content: csv,
      },
    };
  };


  const getSensaiReply = (prompt) => {
    const context = getCrmContext();
    const text = prompt.toLowerCase();
    const csvRequest = getCsvRequest(prompt);

    if (csvRequest) {
      const { clients, attachment } = createClientsCsvAttachment(context, csvRequest);

      return {
        text: `I prepared ${clients.length} ${csvRequest.label} record${clients.length === 1 ? "" : "s"} as a CSV file.`,
        attachment,
      };
    }

    if (text.includes("statistic") || text.includes("my statistics")) return { text: getProfileStats(context) };
    if (text.includes("focus") || text.includes("today")) return { text: getTodayFocus(context) };
    if (text.includes("overdue")) {
      if (!context.overdueTasks.length) return { text: "No overdue tasks found. Nice and clean." };
      return { text: `Overdue tasks: ${context.overdueTasks.map((task) => task.title || "Untitled task").join(", ")}.` };
    }
    if (text.includes("country") || text.includes("timezone") || text.includes("time zone")) return { text: getClientsByCountry(context) };
    if (text.includes("client") || text.includes("pipeline") || text.includes("lead")) return { text: summarizeClients(context) };
    if (text.includes("notification") || text.includes("unread")) {
      return { text: `You have ${context.unreadNotifications.length} unread notification${context.unreadNotifications.length === 1 ? "" : "s"}.` };
    }
    if (text.includes("activity")) return { text: "Open Dashboard > Activity to see the structured timeline. I can explain any activity card after you expand it." };
    if (text.includes("task")) {
      return { text: `You have ${context.openTasks.length} open task${context.openTasks.length === 1 ? "" : "s"}. For creating tasks, I can draft the structure now; real backend AI can create it after confirmation later.` };
    }

    return { text: "I can help with clients, overdue tasks, pipeline summaries, countries/timezones, unread notifications, and today's CRM focus. You can also ask me to export all, lead, won, lost, or contacted clients as CSV." };
  };

  const getTeamRecipients = () => {
    const members = window.crmTeam?.getAssignableMembers?.() || [];
    return members.map((member) => member.label || member.value).filter(Boolean);
  };

  const populateRecipientSelect = () => {
    if (!recipientSelect) return;

    const selectedValue = recipientSelect.value;
    const recipients = getTeamRecipients();

    recipientSelect.innerHTML = recipients.length
      ? recipients.map((recipient) => `<option value="${escapeHtml(recipient)}">${escapeHtml(recipient)}</option>`).join("")
      : '<option value="">No team users yet</option>';

    if (recipients.includes(selectedValue)) {
      recipientSelect.value = selectedValue;
    }
  };

  const getSelectedRecipient = () => recipientSelect?.value || getTeamRecipients()[0] || "";

  const getAvailableRecipients = () => {
    return getTeamRecipients();
  };

  const normalizeConversationMap = (storedValue) => {
    const conversations = {};

    if (Array.isArray(storedValue)) {
      storedValue.forEach((message) => {
        const recipient = message.recipient || getSelectedRecipient();
        if (!recipient) return;
        conversations[recipient] = [...(conversations[recipient] || []), message];
      });
      return conversations;
    }

    if (storedValue && typeof storedValue === "object") {
      Object.entries(storedValue).forEach(([recipient, history]) => {
        conversations[recipient] = Array.isArray(history) ? history : [];
      });
    }

    getAvailableRecipients().forEach((recipient) => {
      conversations[recipient] = conversations[recipient] || [];
    });

    return conversations;
  };

  const readConversationMap = () => {
    try {
      return normalizeConversationMap(JSON.parse(localStorage.getItem(TEAM_KEY) || "null"));
    } catch (error) {
      return normalizeConversationMap(null);
    }
  };

  const saveConversationMap = (conversations) => {
    try {
      localStorage.setItem(TEAM_KEY, JSON.stringify(conversations));
    } catch (error) {
      // Messenger keeps the active thread visible even if storage is unavailable.
    }
  };

  populateRecipientSelect();
  let teamConversations = readConversationMap();
  let activeRecipient = getSelectedRecipient();
  let aiHistory = readHistory(AI_KEY, readHistory(LEGACY_AI_KEY, [
    {
      role: "assistant",
      author: "10X SensAI",
      text: "SensAI online. Ask me about your clients, tasks, reminders, notifications, or today's focus.",
      createdAt: new Date().toISOString(),
    },
  ]));

  const getDefaultAiMessage = () => ({
    role: "assistant",
    author: "10X SensAI",
    text: "SensAI online. Ask me about your clients, tasks, reminders, notifications, or today's focus.",
    createdAt: new Date().toISOString(),
  });

  const renderActiveConversation = () => {
    const history = teamConversations[activeRecipient] || [];
    renderMessages(teamMessages, history, activeRecipient ? `No messages with ${activeRecipient} yet.` : "No team users are available yet.");
    if (teamInput) teamInput.placeholder = activeRecipient ? `Message ${activeRecipient}` : "Add a team user first";
    if (teamInput) teamInput.disabled = !activeRecipient;
    teamForm?.querySelector('button[type="submit"]')?.toggleAttribute("disabled", !activeRecipient);
  };

  renderActiveConversation();
  renderMessages(aiMessages, aiHistory, "No SensAI messages yet.");
  renderSuggestions();

  recipientSelect?.addEventListener("change", () => {
    activeRecipient = getSelectedRecipient();
    teamConversations[activeRecipient] = teamConversations[activeRecipient] || [];
    renderActiveConversation();
  });

  teamForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const messageText = teamInput.value.trim();
    const recipient = getSelectedRecipient();

    if (!messageText || !recipient) return;

    activeRecipient = recipient;
    teamConversations[recipient] = [
      ...(teamConversations[recipient] || []),
      {
        role: "user",
        author: "You",
        recipient,
        text: messageText,
        createdAt: new Date().toISOString(),
      },
    ];
    saveConversationMap(teamConversations);
    renderActiveConversation();
    teamInput.value = "";
    window.crmNotifications?.add(`New Messenger message sent to ${recipient}.`);
    window.crmActivity?.add({
      type: "communication",
      icon: "chat",
      title: `Messenger message sent to ${recipient}`,
      summary: messageText.slice(0, 90),
      status: "Sent",
      relatedLabel: recipient,
      description: messageText,
      details: [["Recipient", recipient]],
      actionHref: "./dashboard.html",
      actionLabel: "Open Dashboard",
    });
  });

  const sendSensaiPrompt = (text) => {
    const prompt = text.trim();
    if (!prompt) return;

    setSensaiState("thinking");
    const reply = getSensaiReply(prompt);

    aiHistory = [
      ...aiHistory,
      {
        role: "user",
        author: "You",
        text: prompt,
        createdAt: new Date().toISOString(),
      },
      {
        role: "assistant",
        author: "10X SensAI",
        text: reply.text,
        attachment: reply.attachment || null,
        createdAt: new Date().toISOString(),
      },
    ];
    saveHistory(AI_KEY, aiHistory);
    renderMessages(aiMessages, aiHistory, "No SensAI messages yet.");
    setSensaiState("speaking");
    window.setTimeout(() => setSensaiState("idle"), 900);
    window.crmNotifications?.add("10X SensAI replied with CRM guidance.");
    window.crmActivity?.add({
      type: "communication",
      icon: "chat",
      title: "10X SensAI replied",
      summary: prompt.slice(0, 90),
      status: "Answered",
      relatedLabel: "10X SensAI",
      description: reply.text,
      details: [["Prompt", prompt]],
      actionHref: "./dashboard.html",
      actionLabel: "Open Dashboard",
    });
  };

  clearTeamChatButton?.addEventListener("click", () => {
    const recipient = getSelectedRecipient();
    teamConversations[recipient] = [];
    saveConversationMap(teamConversations);
    activeRecipient = recipient;
    renderActiveConversation();
    window.crmToast?.show(`Messenger history with ${recipient} cleared.`, "success");
  });

  clearAiChatButton?.addEventListener("click", () => {
    aiHistory = [getDefaultAiMessage()];
    saveHistory(AI_KEY, aiHistory);
    localStorage.removeItem(LEGACY_AI_KEY);
    renderMessages(aiMessages, aiHistory, "No SensAI messages yet.");
    setSensaiState("idle");
    window.crmToast?.show("10X SensAI chat history cleared.", "success");
  });

  /* --- SensAI Prompt Submit Flow --- */
  aiForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    sendSensaiPrompt(aiInput.value);
    aiInput.value = "";
  });

  sensaiSuggestions?.addEventListener("click", (event) => {
    const suggestion = event.target.closest(".js-sensai-suggestion");
    if (!suggestion) return;

    sendSensaiPrompt(suggestion.textContent);
  });
})();
