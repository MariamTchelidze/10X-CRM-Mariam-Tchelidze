"use strict";

/* --- Application Phone Dialer --- */
(function initPhoneDialer() {
  /* --- Phone modal references connect display, keypad, queue, and call notes. --- */
  const dialer = document.querySelector(".js-phone-dialer");
  if (!dialer) return;

  /* --- Call config keeps browser tel links disabled until the user enables calling. --- */
  const PHONE_CONFIG = {
    callingEnabled: false,
    allowedNumber: "",
  };

  /* --- Storage keys connect client phone numbers with saved call notes. --- */
  const CLIENTS_KEY = window.crmConstants?.CLIENTS_KEY || "crm_clients";
  const CALL_NOTES_KEY = "crm_call_notes";

  const display = dialer.querySelector(".js-phone-display");
  const status = dialer.querySelector(".js-phone-status");
  const callButton = dialer.querySelector(".js-phone-call");
  const deleteButton = dialer.querySelector(".js-phone-delete");
  const queueList = dialer.querySelector(".js-phone-queue");
  const noteForm = dialer.querySelector(".js-phone-note-form");
  const noteInput = dialer.querySelector(".js-phone-note");
  /* --- Runtime phone state tracks the dialed number and selected client. --- */
  let currentNumber = "";
  let selectedClient = null;

  const escapeHtml = (value) =>
    String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  /* --- Phone State Helpers --- */
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

  /* --- Number helpers clean and display phone input like a simple dialer. --- */
  const normalizeNumber = (value) => {
    const text = String(value || "").trim();
    const prefix = text.startsWith("+") ? "+" : "";
    return `${prefix}${text.replace(/[^0-9]/g, "")}`;
  };

  const formatNumber = (value) => {
    const normalized = normalizeNumber(value);
    if (!normalized) return "Dial number";
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

  const getClientsWithPhones = () => readArray(CLIENTS_KEY).filter((client) => normalizeNumber(client.phone));

  /* --- Call Queue Rendering --- */
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

  /* --- Keypad helpers add digits, plus sign, backspace, and full clear behavior. --- */
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
      const message = "Calling is disabled from configuration.";
      setStatus(message, "warning");
      window.crmNotifications?.add("Phone call blocked because calling is disabled.");
      window.crmActivity?.add({
        type: "phone",
        icon: "phone",
        title: "Phone call blocked",
        summary: `${normalized} could not be called because calling is disabled.`,
        status: "Blocked",
        relatedLabel: selectedClient?.name || normalized,
        description: "The application phone prevented a real call because calling is disabled in configuration.",
        actionHref: "./dashboard.html",
        actionLabel: "Open Dashboard",
      });
      return;
    }

    if (PHONE_CONFIG.allowedNumber && normalized !== PHONE_CONFIG.allowedNumber) {
      const message = "Calling is available only for the configured number.";
      setStatus(message, "error");
      return;
    }

    const message = "Opening device phone app.";
    setStatus(message, "success");
    window.crmNotifications?.add("CRM Phone started a call.");
    window.crmActivity?.add({
      type: "phone",
      icon: "phone",
      title: "CRM Phone call started",
      summary: `Calling ${selectedClient?.name || normalized}.`,
      status: "Started",
      relatedLabel: selectedClient?.name || normalized,
      description: "A phone call was started from the CRM application phone.",
      actionHref: "./dashboard.html",
      actionLabel: "Open Dashboard",
    });
    window.location.href = `tel:${normalized}`;
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
    window.crmActivity?.add({
      type: "phone",
      icon: "phone",
      title: "Call note saved",
      summary: `${nextNote.company || nextNote.phone} - ${note.slice(0, 70)}`,
      status: "Saved",
      relatedLabel: nextNote.company || nextNote.phone,
      description: note,
      details: [
        ["Phone", nextNote.phone],
        ["Client", nextNote.company || "No selected client"],
      ],
      actionHref: "./profile.html",
      actionLabel: "Open Profile",
    });
  });

  renderQueue();
  updateDisplay();
})();
