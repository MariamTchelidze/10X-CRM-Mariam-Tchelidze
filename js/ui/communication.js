"use strict";

(function initCommunicationModals() {
  const teamForm = document.querySelector(".js-communication-chat-form");
  const teamMessages = document.querySelector(".js-communication-chat-messages");
  const teamInput = document.querySelector(".js-communication-chat-input");
  const aiForm = document.querySelector(".js-ai-chat-form");
  const aiMessages = document.querySelector(".js-ai-chat-messages");
  const aiInput = document.querySelector(".js-ai-chat-input");

  if (!teamForm && !aiForm) return;

  const TEAM_KEY = "crm_team_chat_history";
  const AI_KEY = "crm_ai_chat_history";

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

  const formatTime = (value) =>
    new Date(value).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

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
            <p>${escapeHtml(message.text)}</p>
          </article>
        `,
      )
      .join("");
    container.scrollTop = container.scrollHeight;
  };

  let teamHistory = readHistory(TEAM_KEY, [
    {
      role: "team",
      author: "Mariam",
      text: "Please review today's hot leads.",
      createdAt: new Date().toISOString(),
    },
  ]);
  let aiHistory = readHistory(AI_KEY, [
    {
      role: "assistant",
      author: "CRM Assistant",
      text: "Ask me to draft a follow-up, summarize leads, or plan a task.",
      createdAt: new Date().toISOString(),
    },
  ]);

  renderMessages(teamMessages, teamHistory, "No team messages yet.");
  renderMessages(aiMessages, aiHistory, "No AI messages yet.");

  teamForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = teamInput.value.trim();
    if (!text) return;

    teamHistory = [
      ...teamHistory,
      {
        role: "user",
        author: "You",
        text,
        createdAt: new Date().toISOString(),
      },
    ];
    saveHistory(TEAM_KEY, teamHistory);
    renderMessages(teamMessages, teamHistory, "No team messages yet.");
    teamInput.value = "";
    window.crmNotifications?.add("New internal chat message saved.");
  });

  aiForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = aiInput.value.trim();
    if (!text) return;

    const reply = text.toLowerCase().includes("task")
      ? "I can help structure that task with title, client, priority, due date, and checklist items."
      : "I saved the context. Next JavaScript step can connect this prompt to real CRM actions.";

    aiHistory = [
      ...aiHistory,
      {
        role: "user",
        author: "You",
        text,
        createdAt: new Date().toISOString(),
      },
      {
        role: "assistant",
        author: "CRM Assistant",
        text: reply,
        createdAt: new Date().toISOString(),
      },
    ];
    saveHistory(AI_KEY, aiHistory);
    renderMessages(aiMessages, aiHistory, "No AI messages yet.");
    aiInput.value = "";
    window.crmNotifications?.add("AI assistant replied in AI Chat.");
  });
})();
