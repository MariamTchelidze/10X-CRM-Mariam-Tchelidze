"use strict";

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
          </article>
        `,
      )
      .join("");
    container.scrollTop = container.scrollHeight;
  };

  const getSuggestions = () => {
    const page = document.body.dataset.page || "";
    const shared = ["Today's focus", "Show overdue tasks", "Summarize clients", "Unread notifications"];

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

  const getSensaiReply = (prompt) => {
    const context = getCrmContext();
    const text = prompt.toLowerCase();

    if (text.includes("statistic") || text.includes("my statistics")) return getProfileStats(context);
    if (text.includes("focus") || text.includes("today")) return getTodayFocus(context);
    if (text.includes("overdue")) {
      if (!context.overdueTasks.length) return "No overdue tasks found. Nice and clean.";
      return `Overdue tasks: ${context.overdueTasks.map((task) => task.title || "Untitled task").join(", ")}.`;
    }
    if (text.includes("country") || text.includes("timezone") || text.includes("time zone")) return getClientsByCountry(context);
    if (text.includes("client") || text.includes("pipeline") || text.includes("lead")) return summarizeClients(context);
    if (text.includes("notification") || text.includes("unread")) {
      return `You have ${context.unreadNotifications.length} unread notification${context.unreadNotifications.length === 1 ? "" : "s"}.`;
    }
    if (text.includes("activity")) return "Open Dashboard > Activity to see the structured timeline. I can explain any activity card after you expand it.";
    if (text.includes("task")) {
      return `You have ${context.openTasks.length} open task${context.openTasks.length === 1 ? "" : "s"}. For creating tasks, I can draft the structure now; real backend AI can create it after confirmation later.`;
    }

    return "I can help with clients, overdue tasks, pipeline summaries, countries/timezones, unread notifications, and today's CRM focus.";
  };

  let teamHistory = readHistory(TEAM_KEY, [
    {
      role: "team",
      author: "Mariam",
      recipient: "Sales Team",
      text: "Please review today's hot leads.",
      createdAt: new Date().toISOString(),
    },
  ]);
  let aiHistory = readHistory(AI_KEY, readHistory(LEGACY_AI_KEY, [
    {
      role: "assistant",
      author: "10X SensAI",
      text: "SensAI online. Ask me about your clients, tasks, reminders, notifications, or today's focus.",
      createdAt: new Date().toISOString(),
    },
  ]));

  renderMessages(teamMessages, teamHistory, "No team messages yet.");
  renderMessages(aiMessages, aiHistory, "No SensAI messages yet.");
  renderSuggestions();

  teamForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = teamInput.value.trim();
    const recipient = recipientSelect?.value || "Sales Team";

    if (!text) return;

    teamHistory = [
      ...teamHistory,
      {
        role: "user",
        author: "You",
        recipient,
        text,
        createdAt: new Date().toISOString(),
      },
    ];
    saveHistory(TEAM_KEY, teamHistory);
    renderMessages(teamMessages, teamHistory, "No team messages yet.");
    teamInput.value = "";
    window.crmNotifications?.add(`New Messenger message sent to ${recipient}.`);
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
        text: reply,
        createdAt: new Date().toISOString(),
      },
    ];
    saveHistory(AI_KEY, aiHistory);
    renderMessages(aiMessages, aiHistory, "No SensAI messages yet.");
    setSensaiState("speaking");
    window.setTimeout(() => setSensaiState("idle"), 900);
    window.crmNotifications?.add("10X SensAI replied with CRM guidance.");
  };

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
