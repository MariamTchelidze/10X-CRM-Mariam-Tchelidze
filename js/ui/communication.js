"use strict";

/* --- Messenger and 10X SensAI Prepared UI --- */
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
  const MESSENGER_MESSAGE = "This is a prepared UI for future messenger integration.";
  const SENSAI_MESSAGE = "This is a prepared UI for future AI integration.";

  const escapeHtml = (value) =>
    String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const readJson = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value ?? fallback;
    } catch (error) {
      return fallback;
    }
  };

  const saveJson = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // The visible chat still updates even if storage is unavailable.
    }
  };

  const createMessage = ({ role, author, text, recipient = "" }) => ({
    id: `message-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    role,
    author,
    recipient,
    text,
    createdAt: new Date().toISOString(),
  });

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
          <article class="communication-message communication-message--${escapeHtml(message.role)}">
            <header>
              <strong>${escapeHtml(message.author)}</strong>
              <time>${formatTime(message.createdAt)}</time>
            </header>
            ${message.recipient ? `<span class="communication-message__recipient">To ${escapeHtml(message.recipient)}</span>` : ""}
            <p>${escapeHtml(message.text)}</p>
          </article>
        `,
      )
      .join("");
    container.scrollTop = container.scrollHeight;
  };

  const getRecipients = () =>
    (window.crmTeam?.getAssignableMembers?.() || []).map((member) => member.label || member.value).filter(Boolean);

  const populateRecipientSelect = () => {
    if (!recipientSelect) return;

    const currentValue = recipientSelect.value;
    const recipients = getRecipients();
    recipientSelect.innerHTML = recipients.length
      ? recipients.map((recipient) => `<option value="${escapeHtml(recipient)}">${escapeHtml(recipient)}</option>`).join("")
      : '<option value="">No team users yet</option>';

    if (recipients.includes(currentValue)) {
      recipientSelect.value = currentValue;
    }
  };

  const getRecipient = () => recipientSelect?.value || getRecipients()[0] || "";
  const getDefaultAiHistory = () => [createMessage({ role: "assistant", author: "10X SensAI", text: SENSAI_MESSAGE })];

  const readTeamHistory = () => {
    const history = readJson(TEAM_KEY, {});
    return history && !Array.isArray(history) && typeof history === "object" ? history : {};
  };

  const readAiHistory = () => {
    const history = readJson(AI_KEY, getDefaultAiHistory());
    return Array.isArray(history) ? history : getDefaultAiHistory();
  };

  populateRecipientSelect();

  let teamHistory = readTeamHistory();
  let activeRecipient = getRecipient();
  let aiHistory = readAiHistory();

  const renderTeamChat = () => {
    const history = teamHistory[activeRecipient] || [];
    renderMessages(teamMessages, history, activeRecipient ? `No messages with ${activeRecipient} yet.` : "No team users are available yet.");

    if (teamInput) {
      teamInput.placeholder = activeRecipient ? `Message ${activeRecipient}` : "Add a team user first";
      teamInput.disabled = !activeRecipient;
    }

    teamForm?.querySelector('button[type="submit"]')?.toggleAttribute("disabled", !activeRecipient);
  };

  const setSensaiState = (state = "idle") => {
    if (!sensaiAvatar) return;

    sensaiAvatar.classList.remove("sensai-avatar--idle", "sensai-avatar--thinking", "sensai-avatar--speaking");
    sensaiAvatar.classList.add(`sensai-avatar--${state}`);
  };

  const renderSuggestions = () => {
    if (!sensaiSuggestions) return;

    sensaiSuggestions.innerHTML = "";

    ["Project guidance", "Client summary", "Task help", "Dashboard tips"].forEach((suggestion) => {
      const button = document.createElement("button");
      button.className = "sensai-suggestion js-sensai-suggestion";
      button.type = "button";
      button.textContent = suggestion;
      sensaiSuggestions.append(button);
    });
  };

  recipientSelect?.addEventListener("change", () => {
    activeRecipient = getRecipient();
    teamHistory[activeRecipient] = teamHistory[activeRecipient] || [];
    renderTeamChat();
  });

  teamForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const recipient = getRecipient();
    if (!teamInput.value.trim() || !recipient) return;

    teamHistory[recipient] = [
      ...(teamHistory[recipient] || []),
      createMessage({ role: "system", author: "Messenger", recipient, text: MESSENGER_MESSAGE }),
    ];
    activeRecipient = recipient;
    teamInput.value = "";
    saveJson(TEAM_KEY, teamHistory);
    renderTeamChat();
    window.crmToast?.show(MESSENGER_MESSAGE, "info");
  });

  const sendSensaiMessage = (prompt) => {
    const text = String(prompt || "").trim();
    if (!text) return;

    setSensaiState("thinking");
    aiHistory = [
      ...aiHistory,
      createMessage({ role: "user", author: "You", text }),
      createMessage({ role: "assistant", author: "10X SensAI", text: SENSAI_MESSAGE }),
    ];
    saveJson(AI_KEY, aiHistory);
    renderMessages(aiMessages, aiHistory, "No SensAI messages yet.");
    setSensaiState("speaking");
    window.setTimeout(() => setSensaiState("idle"), 700);
    window.crmToast?.show(SENSAI_MESSAGE, "info");
  };

  aiForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    sendSensaiMessage(aiInput.value);
    aiInput.value = "";
  });

  sensaiSuggestions?.addEventListener("click", (event) => {
    const suggestion = event.target.closest(".js-sensai-suggestion");
    if (suggestion) sendSensaiMessage(suggestion.textContent);
  });

  clearTeamChatButton?.addEventListener("click", () => {
    const recipient = getRecipient();
    teamHistory[recipient] = [];
    saveJson(TEAM_KEY, teamHistory);
    renderTeamChat();
    window.crmToast?.show("Messenger demo history cleared.", "success");
  });

  clearAiChatButton?.addEventListener("click", () => {
    aiHistory = getDefaultAiHistory();
    saveJson(AI_KEY, aiHistory);
    localStorage.removeItem(LEGACY_AI_KEY);
    renderMessages(aiMessages, aiHistory, "No SensAI messages yet.");
    setSensaiState("idle");
    window.crmToast?.show("10X SensAI chat history cleared.", "success");
  });

  renderSuggestions();
  renderTeamChat();
  renderMessages(aiMessages, aiHistory, "No SensAI messages yet.");
})();
