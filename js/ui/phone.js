"use strict";

(function initPhoneDialer() {
  const dialer = document.querySelector(".js-phone-dialer");
  if (!dialer) return;

  const PHONE_CONFIG = {
    callingEnabled: false,
    demoNumber: "+995574431557",
  };
  const CLIENTS_KEY = window.crmConstants?.CLIENTS_KEY || "crm_clients";
  const CALL_NOTES_KEY = "crm_call_notes";

  const display = dialer.querySelector(".js-phone-display");
  const status = dialer.querySelector(".js-phone-status");
  const callButton = dialer.querySelector(".js-phone-call");
  const deleteButton = dialer.querySelector(".js-phone-delete");
  const queueList = dialer.querySelector(".js-phone-queue");
  const noteForm = dialer.querySelector(".js-phone-note-form");
  const noteInput = dialer.querySelector(".js-phone-note");
  let currentNumber = "";
  let selectedClient = null;

  const escapeHtml = (value) =>
    String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const readArray = (key) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  };

  const writeArray = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // The current page still updates even if storage is unavailable.
    }
  };

  const normalizeNumber = (value) => {
    const text = String(value || "").trim();
    const prefix = text.startsWith("+") ? "+" : "";
    return `${prefix}${text.replace(/[^0-9]/g, "")}`;
  };

  const formatNumber = (value) => {
    const normalized = normalizeNumber(value);
    if (!normalized) return "Dial number";
    if (normalized === PHONE_CONFIG.demoNumber) return "+995 574 431 557";
    return normalized.replace(/(.{4})/g, "$1 ").trim();
  };

  const updateDisplay = () => {
    display.textContent = formatNumber(currentNumber);
    display.classList.toggle("is-empty", !normalizeNumber(currentNumber));
  };

  const setStatus = (message, type = "muted") => {
    status.textContent = message;
    status.dataset.state = type;
  };

  const getClientsWithPhones = () =>
    readArray(CLIENTS_KEY).filter((client) => normalizeNumber(client.phone));

  const renderQueue = () => {
    const clients = getClientsWithPhones().slice(0, 6);

    if (!clients.length) {
      queueList.innerHTML = '<p class="phone-dialer__empty">No client phone numbers saved yet.</p>';
      return;
    }

    queueList.innerHTML = clients
      .map(
        (client) => `
          <button class="phone-dialer__queue-item js-phone-client" type="button" data-client-id="${escapeHtml(client.id)}">
            <span>
              <strong>${escapeHtml(client.name || "Unnamed client")}</strong>
              <small>${escapeHtml(client.company || "No company")}</small>
            </span>
            <em>${escapeHtml(formatNumber(client.phone))}</em>
          </button>
        `,
      )
      .join("");
  };

  const addKey = (key) => {
    if (key === "+" && normalizeNumber(currentNumber)) return;

    currentNumber = key === "+" ? "+" : `${normalizeNumber(currentNumber)}${key}`;
    selectedClient = null;
    setStatus("Number updated.", "muted");
    updateDisplay();
  };

  dialer.addEventListener("click", (event) => {
    const key = event.target.closest(".js-phone-key");
    const clientButton = event.target.closest(".js-phone-client");

    if (key) {
      addKey(key.dataset.phoneKey);
      return;
    }

    if (clientButton) {
      const clients = getClientsWithPhones();
      selectedClient = clients.find((client) => String(client.id) === clientButton.dataset.clientId) || null;
      currentNumber = selectedClient?.phone || "";
      setStatus(`${selectedClient?.name || "Client"} selected.`, "success");
      updateDisplay();
    }
  });

  deleteButton.addEventListener("click", () => {
    currentNumber = normalizeNumber(currentNumber).slice(0, -1);
    selectedClient = null;
    setStatus(currentNumber ? "Last digit removed." : "Number cleared.", "muted");
    updateDisplay();
  });

  callButton.addEventListener("click", () => {
    const normalized = normalizeNumber(currentNumber);

    if (!normalized) {
      setStatus("Enter a number before calling.", "error");
      return;
    }

    if (!PHONE_CONFIG.callingEnabled) {
      const message = "Calling is disabled in demo mode.";
      setStatus(message, "warning");
      window.crmNotifications?.add("Phone call blocked because demo calling is disabled.");
      return;
    }

    if (normalized !== PHONE_CONFIG.demoNumber) {
      const message = "Calling is available only for the verified demo number.";
      setStatus(message, "error");
      return;
    }

    const message = "Opening device phone app.";
    setStatus(message, "success");
    window.crmNotifications?.add("CRM Phone started a demo call.");
    window.location.href = `tel:${PHONE_CONFIG.demoNumber}`;
  });

  noteForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const note = noteInput.value.trim();
    const normalized = normalizeNumber(currentNumber);

    if (!note) {
      setStatus("Write a note before saving.", "error");
      return;
    }

    const notes = readArray(CALL_NOTES_KEY);
    const nextNote = {
      id: `call-note-${Date.now()}`,
      clientId: selectedClient?.id || null,
      clientName: selectedClient?.name || "Manual number",
      company: selectedClient?.company || "",
      phone: normalized,
      note,
      createdAt: new Date().toISOString(),
    };

    writeArray(CALL_NOTES_KEY, [nextNote, ...notes]);
    noteInput.value = "";
    setStatus("Call note saved to Profile Call History.", "success");
    window.dispatchEvent(new CustomEvent("crm:call-note-saved", { detail: nextNote }));
    window.crmNotifications?.add("New call note saved to Profile Call History.");
  });

  renderQueue();
  updateDisplay();
})();
