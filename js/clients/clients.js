"use strict";

/* --- Clients Page Controller --- */
const clientsPage = document.querySelector(".clientsPage");

initClients();

function initClients() {
  if (!clientsPage) return;

  /* --- Shared modules connect clients to storage, API, validation, and card rendering. --- */
  const constants = window.crmConstants;
  const storage = window.crmStorage;
  const data = window.crmData;
  const cards = window.crmClientCards;
  const formHelpers = window.crmClientForm;

  if (!constants || !storage || !data || !cards || !formHelpers) return;

  /* --- DOM references collect the client list, forms, modals, and status panels. --- */
  const list = document.getElementById("clients-list");
  const loading = document.getElementById("clients-loading");
  const error = document.getElementById("clients-error");
  const errorMessage = document.querySelector(".js-clients-error-message");
  const empty = document.getElementById("clients-empty");
  const importClientsButtons = document.querySelectorAll(".js-import-clients");
  const form = document.querySelector(".js-client-form");
  const openClientModalButton = document.querySelector(".js-open-client-modal");
  const clientModalTitle = document.getElementById("client-modal-title");
  const clientModalDescription = document.getElementById("client-modal-description");
  const saveClientButton = document.querySelector(".js-save-client");
  const clientNotesField = document.getElementById("client-notes")?.closest(".field");
  const retryButton = document.querySelector(".js-retry-clients");
  const searchInput = document.querySelector(".js-client-search");
  const sortSelect = document.querySelector(".js-client-sort");
  const statusFilters = document.querySelectorAll(".js-status-filter");
  const deleteModal = document.getElementById("delete-client-modal");
  const confirmDeleteButton = document.querySelector(".js-confirm-delete");
  const detailsModal = document.getElementById("client-details-modal");
  const detailsContent = document.getElementById("client-details-content");
  const openDetailsHelper = document.querySelector(".js-open-client-details-helper");
  const noteForm = document.querySelector(".js-note-form");
  const noteTextInput = document.querySelector(".js-client-note-text");
  const noteStatusSelect = document.querySelector(".js-client-note-status");
  const noteTaskSelect = document.querySelector(".js-client-note-task");
  const noteNewTaskField = document.querySelector(".js-client-note-new-task-field");
  const noteNewTaskInput = document.querySelector(".js-client-note-new-task");
  const noteError = document.querySelector(".js-client-note-error");
  const notesList = document.querySelector(".js-client-notes-list");
  const noteDeleteModal = document.getElementById("delete-note-modal");
  const noteDeleteMessage = document.querySelector(".js-delete-note-message");
  const confirmDeleteNoteButton = document.querySelector(".js-confirm-delete-note");
  const reminderInput = document.querySelector(".js-client-reminder-input");
  const setReminderButton = document.querySelector(".js-set-reminder");
  const reminderStatus = document.querySelector(".js-client-reminder-status");
  const clientStatusForm = document.querySelector(".js-client-status-form");
  const clientStatusSelect = document.querySelector(".js-client-status-select");
  const selectionBar = document.querySelector(".js-client-selection-bar");
  const selectedClientsCount = document.querySelector(".js-selected-clients-count");
  const selectVisibleButton = document.querySelector(".js-select-visible-clients");
  const clearSelectionButton = document.querySelector(".js-clear-client-selection");
  const deleteSelectedButton = document.querySelector(".js-delete-selected-clients");

  if (!list) return;

  formHelpers.bindPhoneInputFilter?.(form);

  /* --- Page State --- */
  let clients = [];
  let activeStatus = "all";
  let pendingDeleteId = null;
  let pendingNoteDeleteId = null;
  let editingClientId = null;
  const selectedClientIds = new Set();
  /* --- Storage keys and UI messages connect client notes with task-board data. --- */
  const TASKS_KEY = "crm_tasks";
  const DEFAULT_CLIENTS_ERROR = "Could not load clients. Check your connection and try again.";

  const moneyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  /* --- Small Formatting and Safety Helpers --- */
  const getSummaryElement = (id) => document.getElementById(id);
  /* --- Escape HTML Characters to prevent unsafe rendering --- */
  const escapeHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  /* --- Generate a user-friendly error message for asynchronous operations. --- */

  const getAsyncErrorMessage = (error, fallback = DEFAULT_CLIENTS_ERROR) => {
    if (!navigator.onLine) return "You appear to be offline. Check your connection and try again.";
    if (error?.message && !error.status) return error.message;
    return error?.status ? `${fallback} Status: ${error.status}.` : fallback;
  };

  const normalizeClientPhone = (value = "") => {
    const text = String(value || "").trim();
    const prefix = text.startsWith("+") ? "+" : "";
    return `${prefix}${text.replace(/[^0-9]/g, "")}`;
  };

  /* --- Toggle a button's loading state during asynchronous actions. --- */

  const setButtonLoading = (button, isLoading, loadingText = "Loading...") => {
    if (!button) return;

    if (isLoading) {
      if (!button.dataset.originalText) button.dataset.originalText = button.textContent;
      button.textContent = loadingText;
      button.disabled = true;
      return;
    }

    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
    delete button.dataset.originalText;
  };

  /* --- Note/task constants define note statuses and cross-page task opening. --- */
  const PENDING_TASK_KEY = "crm_pending_open_task";
  const NOTE_STATUSES = [
    { value: "", label: "No status" },
    { value: "reviewed", label: "Reviewed" },
    { value: "approved", label: "Approved" },
    { value: "declined", label: "Declined" },
    { value: "processed", label: "Processed" },
  ];

  /* --- Phone-code timezone map supports client country clocks and manual clients. --- */
  const CLIENT_TIMEZONES = [
    /* 🇬🇪 Georgia & neighborhood*/
    { code: "+995", country: "Georgia", timezone: "Asia/Tbilisi" },
    { code: "+90", country: "Turkey", timezone: "Europe/Istanbul" },
    { code: "+374", country: "Armenia", timezone: "Asia/Yerevan" },
    { code: "+994", country: "Azerbaijan", timezone: "Asia/Baku" },

    /* 🌍 G7 countries */
    { code: "+1", country: "United States / Canada", timezone: "America/New_York" },
    { code: "+44", country: "United Kingdom", timezone: "Europe/London" },
    { code: "+49", country: "Germany", timezone: "Europe/Berlin" },
    { code: "+33", country: "France", timezone: "Europe/Paris" },
    { code: "+39", country: "Italy", timezone: "Europe/Rome" },
    { code: "+81", country: "Japan", timezone: "Asia/Tokyo" },

    /*🇪🇺 Main European countries*/
    { code: "+34", country: "Spain", timezone: "Europe/Madrid" },
    { code: "+31", country: "Netherlands", timezone: "Europe/Amsterdam" },
    { code: "+48", country: "Poland", timezone: "Europe/Warsaw" },
    { code: "+41", country: "Switzerland", timezone: "Europe/Zurich" },
    { code: "+43", country: "Austria", timezone: "Europe/Vienna" },
    { code: "+32", country: "Belgium", timezone: "Europe/Brussels" },
    { code: "+45", country: "Denmark", timezone: "Europe/Copenhagen" },
    { code: "+46", country: "Sweden", timezone: "Europe/Stockholm" },
    { code: "+47", country: "Norway", timezone: "Europe/Oslo" },
    { code: "+358", country: "Finland", timezone: "Europe/Helsinki" },
    { code: "+351", country: "Portugal", timezone: "Europe/Lisbon" },
    { code: "+353", country: "Ireland", timezone: "Europe/Dublin" },
    { code: "+420", country: "Czech Republic", timezone: "Europe/Prague" },
    { code: "+380", country: "Ukraine", timezone: "Europe/Kyiv" },

    /*💻 Asia's main Techno hubs*/
    { code: "+82", country: "South Korea", timezone: "Asia/Seoul" },
    { code: "+86", country: "China", timezone: "Asia/Shanghai" },
    { code: "+91", country: "India", timezone: "Asia/Kolkata" },
    { code: "+65", country: "Singapore", timezone: "Asia/Singapore" },

    /*🌏 Main Asian countries */
    { code: "+971", country: "United Arab Emirates", timezone: "Asia/Dubai" },
    { code: "+966", country: "Saudi Arabia", timezone: "Asia/Riyadh" },
    { code: "+66", country: "Thailand", timezone: "Asia/Bangkok" },
    { code: "+60", country: "Malaysia", timezone: "Asia/Kuala_Lumpur" },
    { code: "+84", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh" },

    /*🌎 USA*/
    { code: "+52", country: "Mexico", timezone: "America/Mexico_City" },
    { code: "+55", country: "Brazil", timezone: "America/Sao_Paulo" },
    { code: "+54", country: "Argentina", timezone: "America/Argentina/Buenos_Aires" },
    { code: "+56", country: "Chile", timezone: "America/Santiago" },

    /*🌍  Africa*/
    { code: "+27", country: "South Africa", timezone: "Africa/Johannesburg" },
    { code: "+20", country: "Egypt", timezone: "Africa/Cairo" },
    { code: "+234", country: "Nigeria", timezone: "Africa/Lagos" },

    /*🦘 Countries of Oceania*/
    { code: "+61", country: "Australia", timezone: "Australia/Sydney" },
    { code: "+64", country: "New Zealand", timezone: "Pacific/Auckland" },
  ].sort((a, b) => b.code.length - a.code.length);

  /* --- Timezone helpers infer country data from international phone numbers. --- */
  const normalizePhone = (phone = "") => String(phone).replace(/[^\d+]/g, "");
  /* --- Detect a client's timezone from their international phone number. --- */

  const detectClientTimezone = (phone = "") => {
    const normalized = normalizePhone(phone);
    if (!normalized.startsWith("+")) return null;
    return CLIENT_TIMEZONES.find((item) => normalized.startsWith(item.code)) || null;
  };
  /* --- Generate a readable timezone label for a client. --- */

  const getTimezoneLabel = (client) => {
    const country = client?.country || "";
    const timezone = client?.timezone || "";
    if (country && timezone) return `${country} - ${timezone}`;
    if (timezone) return timezone;

    const detected = detectClientTimezone(client?.phone);
    return detected ? `${detected.country} - ${detected.timezone}` : "Not selected";
  };

  const CLIENT_STATUSES = ["lead", "contacted", "won", "lost"];

  /* --- Data Normalization --- */
  const normalizeNote = (note = {}, index = 0) => {
    const fallbackDate = note.date || note.createdAt || new Date().toLocaleString();

    return {
      ...note,
      id: note.id || note._id || createId(`note-${index}`),
      text: String(note.text || note.message || "").trim(),
      author: note.author || "CRM User",
      date: fallbackDate,
      status: NOTE_STATUSES.some((status) => status.value === note.status) ? note.status : "",
      taskId: note.taskId || "",
      taskTitle: note.taskTitle || "",
    };
  };
  /* --- Normalize and sanitize client data before storing or using it. --- */

  const normalizeClient = (client = {}, index = 0) => {
    const id = client.id || client._id || createId(`client-${index}`);
    const status = CLIENT_STATUSES.includes(client.status) ? client.status : "lead";
    const notes = Array.isArray(client.notes) ? client.notes.map(normalizeNote).filter((note) => note.text) : [];
    const dealValue = Number(client.dealValue ?? client.value ?? 0);

    return {
      ...client,
      id,
      name: String(client.name || "Unnamed Client").trim(),
      company: String(client.company || "No company").trim(),
      email: String(client.email || "")
        .trim()
        .toLowerCase(),
      phone: String(client.phone || "").trim(),
      country: String(client.country || detectClientTimezone(client.phone)?.country || "").trim(),
      timezone: String(client.timezone || detectClientTimezone(client.phone)?.timezone || "").trim(),
      status,
      dealValue: Number.isFinite(dealValue) ? dealValue : 0,
      notes,
      createdAt: client.createdAt || new Date().toISOString(),
      reminderAt: client.reminderAt || "",
      reminderNotified: Boolean(client.reminderNotified),
    };
  };
  /* --- Normalize an array of client objects. --- */

  const normalizeClients = (items = []) => {
    return (Array.isArray(items) ? items : []).map(normalizeClient);
  };
  /* --- Update the client collection and optionally save it to storage. --- */

  const setClients = (items, shouldSave = true) => {
    clients = normalizeClients(items);
    if (shouldSave) saveClients();
  };

  /* --- Detail helpers fill modal fields and format stored dates safely. --- */
  const setDetailText = (selector, value) => {
    const element = detailsModal?.querySelector(selector);
    if (element) element.textContent = value;
  };
  /* --- Format a client date for display. --- */

  const formatClientDate = (value) => {
    if (!value) return "Unknown";

    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getClientById = (clientId) => {
    return clients.find((client) => String(client.id) === String(clientId)) || null;
  };

  const getCurrentUserName = () => {
    const session = storage.read(constants.SESSION_KEY, null);
    const users = storage.read(constants.USERS_KEY, []);
    const currentUser = users.find((user) => user.id === session?.userId || user.email === session?.email);

    return currentUser?.fullName || session?.email || "CRM User";
  };
  /* --- Record a client-related activity in the activity log. --- */

  const logClientActivity = (entry) => {
    window.crmActivity?.add({
      type: entry.type || "client",
      icon: entry.icon || "users",
      actionHref: "./clients.html",
      actionLabel: "Open Clients",
      ...entry,
    });
  };

  /* --- Task helpers attach client notes to existing or newly created tasks. --- */
  const getStoredTasks = () => storage.read(TASKS_KEY, []);

  const saveStoredTasks = (tasks) => {
    storage.write(TASKS_KEY, tasks);
  };

  const getAvailableTasks = () => {
    return getStoredTasks()
      .filter((task) => !task.archived && !task.deleted)
      .map((task) => ({ id: task.id, title: task.title || "Untitled task" }));
  };

  const renderTaskOptions = () => {
    if (!noteTaskSelect) return;

    const tasks = getAvailableTasks();

    noteTaskSelect.innerHTML = '<option value="">No task attached</option>';
    tasks.forEach((task) => {
      const option = document.createElement("option");
      option.value = task.id;
      option.textContent = task.title;
      noteTaskSelect.append(option);
    });

    const createOption = document.createElement("option");
    createOption.value = "__create_new_task__";
    createOption.textContent = "Create new task from this note";
    noteTaskSelect.append(createOption);
  };

  const toggleNewTaskField = () => {
    if (!noteNewTaskField) return;

    const shouldShow = noteTaskSelect?.value === "__create_new_task__";
    noteNewTaskField.hidden = !shouldShow;

    if (!shouldShow && noteNewTaskInput) {
      noteNewTaskInput.value = "";
    }
  };

  /* --- Reminder helpers keep the client follow-up UI readable. --- */
  const getNoteCountLabel = (count) => `${count} ${count === 1 ? "note" : "notes"}`;

  const formatReminderDate = (value) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* --- Convert a date value to a datetime-local input format. --- */

  const getDateTimeLocalValue = (value) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().slice(0, 16);
  };

  /* --- Update the reminder input and status for the selected client. --- */

  const renderReminderState = (client) => {
    if (!reminderInput || !reminderStatus) return;

    reminderInput.value = getDateTimeLocalValue(client?.reminderAt);

    if (!client?.reminderAt) {
      reminderStatus.textContent = "No reminder set for this client.";
      reminderStatus.dataset.state = "empty";
      return;
    }

    const reminderTime = new Date(client.reminderAt).getTime();
    const isDue = reminderTime <= Date.now();

    reminderStatus.textContent =
      client.reminderNotified || isDue
        ? `Reminder sent: follow up with ${client.name}.`
        : `Reminder set for ${formatReminderDate(client.reminderAt)}.`;
    reminderStatus.dataset.state = client.reminderNotified || isDue ? "sent" : "scheduled";
  };

  /* --- Note delete/status helpers manage individual note actions inside the modal. --- */
  const getNoteById = (clientId, noteId) => {
    const client = getClientById(clientId);
    const notes = Array.isArray(client?.notes) ? client.notes : [];

    return notes.find((note) => String(note.id) === String(noteId)) || null;
  };

  /* --- Open the note deletion confirmation modal. --- */

  const openNoteDeleteModal = (note) => {
    if (!noteDeleteModal || !noteDeleteMessage || !note) return;

    const attachedTask = note.taskId ? getStoredTasks().find((task) => String(task.id) === String(note.taskId)) : null;
    const noteStatus = note.status || "";
    const processedStatus =
      noteStatus === "processed" || attachedTask?.status === "done" ? noteStatus || "done" : noteStatus;
    const statusLabel = processedStatus ? data.formatStatus(processedStatus) : "No status";
    const isProcessed = noteStatus === "processed" || attachedTask?.status === "done";

    noteDeleteMessage.innerHTML = isProcessed
      ? `The note you're trying to delete has <strong>${escapeHtml(statusLabel)}</strong> status. Are you sure you want to delete it? <strong>This action can't be undone.</strong>`
      : `The note you're trying to delete isn't fully processed yet. Are you sure you want to delete it? <strong>This action can't be undone.</strong>`;

    noteDeleteModal.hidden = false;
    noteDeleteModal.dataset.modalState = "open";
    noteDeleteModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    window.requestAnimationFrame(() => confirmDeleteNoteButton?.focus({ preventScroll: true }));
  };

  const closeNoteDeleteModal = () => {
    if (!noteDeleteModal) return;

    noteDeleteModal.hidden = true;
    noteDeleteModal.dataset.modalState = "closed";
    noteDeleteModal.setAttribute("aria-hidden", "true");
    pendingNoteDeleteId = null;
  };

  /* --- Generate note status options for the status dropdown. --- */

  const renderNoteStatusOptions = (selectedStatus = "") => {
    return NOTE_STATUSES.map((status) => {
      const selected = status.value === selectedStatus ? " selected" : "";

      return `<option value="${escapeHtml(status.value)}"${selected}>${escapeHtml(status.label)}</option>`;
    }).join("");
  };

  /* --- Update the status of a specific client note. --- */

  const updateNoteStatus = (clientId, noteId, nextStatus) => {
    updateClient(clientId, (client) => ({
      ...client,
      notes: (Array.isArray(client.notes) ? client.notes : []).map((note) =>
        String(note.id) === String(noteId) ? { ...note, status: nextStatus } : note,
      ),
    }));
  };

  /* --- Render all notes for the selected client. --- */

  const renderClientNotes = (notes = []) => {
    if (!notesList) return;

    if (!notes.length) {
      notesList.innerHTML = '<p class="client-notes__empty">No notes yet.</p>';
      return;
    }

    notesList.innerHTML = notes
      .map((note) => {
        const status = note.status || "none";
        const statusLabel = note.status ? data.formatStatus(note.status) : "No status";
        const taskLabel = note.taskTitle || "No task attached";
        const taskAction = note.taskId
          ? `<button class="client-note-card__task-action js-open-attached-task" type="button" data-task-id="${escapeHtml(note.taskId)}">Open attached task</button>`
          : "";
        const noteId = escapeHtml(note.id || "");

        return `
          <article class="client-note-card">
            <header class="client-note-card__header">
              <div>
                <h4 class="client-note-card__author">${escapeHtml(note.author || "CRM User")}</h4>
                <p class="client-note-card__date">${escapeHtml(note.date || "")}</p>
              </div>
              <span class="client-note-card__status client-note-card__status--${escapeHtml(status)}">
                ${escapeHtml(statusLabel)}
              </span>
            </header>
            <p class="client-note-card__task">Task: ${escapeHtml(taskLabel)}</p>
            <p class="client-note-card__text">${escapeHtml(note.text)}</p>
            <div class="client-note-card__actions">
              ${taskAction}
              <button
                class="client-note-card__edit js-edit-note-status"
                type="button"
                data-note-id="${noteId}"
              >
                Edit status
              </button>
              <button
                class="client-note-card__delete js-delete-client-note"
                type="button"
                data-note-id="${noteId}"
                data-skip-delete-confirm
              >
                Delete note
              </button>
            </div>
            <form class="client-note-card__status-editor js-note-status-editor" data-note-id="${noteId}" hidden>
              <label class="visually-hidden" for="note-status-${noteId}">Note status</label>
              <select class="input select-field js-note-status-select" id="note-status-${noteId}">
                ${renderNoteStatusOptions(note.status || "")}
              </select>
              <button class="btn btn--secondary" type="submit">Save</button>
              <button class="btn btn--ghost js-cancel-note-status" type="button">Cancel</button>
            </form>
          </article>
        `;
      })
      .join("");
  };

  /* --- State update helper changes one client, then saves the whole list. --- */
  const persistClientUpdate = (client) => {
    if (!client?.id || !data.updateClientRequest) return;

    data.updateClientRequest(client.id, client).catch((error) => {
      window.crmToast?.show(
        getAsyncErrorMessage(error, "Client change was saved locally, but backend sync failed."),
        "error",
      );
    });
  };

  const updateClient = (clientId, updater, shouldSync = true) => {
    let updatedClient = null;

    clients = clients.map((client) =>
      String(client.id) === String(clientId) ? (updatedClient = updater(client)) : client,
    );
    saveClients();

    if (shouldSync && updatedClient) {
      persistClientUpdate(updatedClient);
    }
  };

  /* --- Client Details Modal Rendering --- */
  const renderClientDetails = (client) => {
    if (!detailsModal || !detailsContent || !client) return;

    const status = client.status || "lead";
    const notes = Array.isArray(client.notes) ? client.notes : [];
    const statusBadge = detailsModal.querySelector("[data-details-status]");

    detailsContent.dataset.activeClientId = String(client.id);
    detailsModal.querySelector("#client-details-title").textContent = client.name || "Unnamed Client";
    setDetailText("[data-details-initials]", data.getInitials(client.name));
    setDetailText("[data-details-company]", client.company || "No company");
    setDetailText("[data-details-created]", formatClientDate(client.createdAt));
    setDetailText("[data-details-email]", client.email || "No email");
    setDetailText("[data-details-phone]", client.phone || "No phone");
    setDetailText("[data-details-country-timezone]", getTimezoneLabel(client));
    setDetailText("[data-details-value]", moneyFormatter.format(Number(client.dealValue) || 0));
    setDetailText("[data-details-note-count]", getNoteCountLabel(notes.length));
    setDetailText("[data-details-note-count-inline]", getNoteCountLabel(notes.length));
    renderClientNotes(notes);
    renderTaskOptions();
    renderReminderState(client);
    if (noteError) noteError.hidden = true;

    if (clientStatusSelect) clientStatusSelect.value = status;

    if (statusBadge) {
      statusBadge.textContent = data.formatStatus(status);
      statusBadge.className = `status-badge status-badge--${status}`;
    }
  };

  const openClientDetails = (clientId) => {
    const client = getClientById(clientId);

    if (!client) return;

    renderClientDetails(client);
    openDetailsHelper?.click();
  };

  /* --- Loading and Error UI State --- */
  const setLoading = (isLoading) => {
    if (loading) loading.hidden = !isLoading;
    if (error) error.hidden = true;
    if (empty && isLoading) empty.hidden = true;
  };

  const setError = (message = DEFAULT_CLIENTS_ERROR) => {
    if (loading) loading.hidden = true;
    if (error) error.hidden = false;
    if (errorMessage) errorMessage.textContent = message;
    if (empty) empty.hidden = true;
  };

  const saveClients = () => {
    storage.write(constants.CLIENTS_KEY, clients);
  };

  setClients(storage.read(constants.CLIENTS_KEY, []));

  const updateSummary = () => {
    getSummaryElement("clients-count-total").textContent = clients.length;
    getSummaryElement("clients-count-lead").textContent = clients.filter((client) => client.status === "lead").length;
    getSummaryElement("clients-count-contacted").textContent = clients.filter(
      (client) => client.status === "contacted",
    ).length;
    getSummaryElement("clients-count-won").textContent = clients.filter((client) => client.status === "won").length;
  };

  /* --- Filter pipeline combines status, search text, and sort order. --- */
  const getFilteredClients = () => {
    const query = String(searchInput?.value || "")
      .trim()
      .toLowerCase();
    const sortValue = sortSelect?.value || "created-desc";

    const filteredClients = clients.filter((client) => {
      const matchesStatus = activeStatus === "all" || client.status === activeStatus;
      const searchableText = [client.name, client.company, client.email, client.phone, client.country, client.timezone]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !query || searchableText.includes(query);

      return matchesStatus && matchesSearch;
    });

    return filteredClients.sort((firstClient, secondClient) => {
      const firstName = String(firstClient.name || "").toLowerCase();
      const secondName = String(secondClient.name || "").toLowerCase();
      const firstValue = Number(firstClient.dealValue) || 0;
      const secondValue = Number(secondClient.dealValue) || 0;
      const firstCreated = new Date(firstClient.createdAt || 0).getTime();
      const secondCreated = new Date(secondClient.createdAt || 0).getTime();

      if (sortValue === "name-asc") return firstName.localeCompare(secondName);
      if (sortValue === "name-desc") return secondName.localeCompare(firstName);
      if (sortValue === "value-desc") return secondValue - firstValue;
      if (sortValue === "value-asc") return firstValue - secondValue;

      return secondCreated - firstCreated;
    });
  };

  /* --- Bulk selection helpers keep selected client cards and toolbar in sync. --- */
  const syncSelectedCards = () => {
    list.querySelectorAll(".js-client-select").forEach((checkbox) => {
      checkbox.checked = selectedClientIds.has(String(checkbox.value));
    });
  };

  const renderSelectionBar = () => {
    const selectedCount = selectedClientIds.size;

    if (selectedClientsCount) selectedClientsCount.textContent = String(selectedCount);
    if (selectionBar) selectionBar.hidden = selectedCount === 0;
    if (deleteSelectedButton) deleteSelectedButton.disabled = selectedCount === 0;
  };

  const clearClientSelection = () => {
    selectedClientIds.clear();
    syncSelectedCards();
    renderSelectionBar();
  };

  const selectVisibleClients = () => {
    const visibleClients = getFilteredClients();

    if (!visibleClients.length) {
      window.crmToast?.show("No visible clients to select.", "info");
      return;
    }

    visibleClients.forEach((client) => selectedClientIds.add(String(client.id)));
    syncSelectedCards();
    renderSelectionBar();
    window.crmToast?.show(`${visibleClients.length} visible clients selected.`, "info");
  };

  const renderClients = () => {
    const visibleClients = getFilteredClients();

    list.innerHTML = ""; //changeable place add texts if needed
    visibleClients.forEach((client) => list.append(cards.renderClientCard(client)));
    syncSelectedCards();

    if (empty) {
      empty.hidden = visibleClients.length > 0;
    }

    updateSummary();
    renderSelectionBar();
  };

  /* --- Reminder automation creates notifications when follow-up time arrives. --- */
  const triggerClientReminder = (client) => {
    if (!client || client.reminderNotified || !client.reminderAt) return;

    window.crmNotifications?.add(`Follow up: ${client.name}`);
    window.crmToast?.show(`Reminder: follow up with ${client.name}.`, "info");

    updateClient(client.id, (item) => ({
      ...item,
      reminderNotified: true,
    }));

    if (detailsContent?.dataset.activeClientId === String(client.id)) {
      renderReminderState(getClientById(client.id));
    }
  };

  const checkClientReminders = () => {
    const now = Date.now();

    clients
      .filter((client) => client.reminderAt && !client.reminderNotified)
      .forEach((client) => {
        const reminderTime = new Date(client.reminderAt).getTime();

        if (!Number.isNaN(reminderTime) && reminderTime <= now) {
          triggerClientReminder(client);
        }
      });
  };

  /* --- API Load and Reminder Checks --- */
  const loadClients = async () => {
    setLoading(true);
    setButtonLoading(retryButton, true, "Retrying...");

    try {
      setClients(await data.fetchInitialClients());
      renderClients();
      checkClientReminders();
      setLoading(false);
    } catch (loadError) {
      const message = getAsyncErrorMessage(loadError);
      setError(message);
      window.crmToast?.show(message, "error");
    } finally {
      setButtonLoading(retryButton, false);
    }
  };

  const importStarterClients = async () => {
    if (!data.fetchDemoClients || !data.postClient) return;

    importClientsButtons.forEach((button) => setButtonLoading(button, true, "Importing..."));

    try {
      const starterClients = await data.fetchDemoClients();
      const existingEmails = new Set(clients.map((client) => client.email));
      const clientsToImport = starterClients.filter(
        (client) => !existingEmails.has(String(client.email || "").toLowerCase()),
      );

      if (!clientsToImport.length) {
        window.crmToast?.show("Starter clients are already imported.", "info");
        return;
      }

      const normalizedClients = clientsToImport.map((client) => ({
        ...client,
        phone: normalizeClientPhone(client.phone),
      }));
      const importedClients = await Promise.all(normalizedClients.map((client) => data.postClient(client)));
      setClients([...importedClients, ...clients]);
      renderClients();
      logClientActivity({
        title: "Starter clients imported",
        summary: `${importedClients.length} clients were imported into this account.`,
        status: "Imported",
        relatedLabel: "Clients",
        description: "Starter clients were fetched and saved through the backend clients API.",
        details: [["Imported clients", String(importedClients.length)]],
      });
      window.crmToast?.show(`${importedClients.length} starter clients imported.`, "success");
    } catch (importError) {
      window.crmToast?.show(getAsyncErrorMessage(importError, "Starter clients could not be imported."), "error");
    } finally {
      importClientsButtons.forEach((button) => setButtonLoading(button, false));
    }
  };

  /* --- Form mode helpers switch the modal between add and edit behavior. --- */
  const fillClientForm = (client) => {
    if (!form || !client) return;

    form.elements.name.value = client.name || "";
    form.elements.company.value = client.company || "";
    form.elements.email.value = client.email || "";
    form.elements.phone.value = client.phone || "";
    form.elements.timezone.value = client.timezone || detectClientTimezone(client.phone)?.timezone || "";
    form.elements.status.value = client.status || "lead";
    form.elements.value.value = Number(client.dealValue) || "";
    form.elements.notes.value = "";
    form.elements.status.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const setClientFormMode = (mode, client = null) => {
    if (!form) return;

    window.crmValidation?.clearFormErrors(form);
    editingClientId = mode === "edit" ? String(client?.id || "") : null;

    if (mode === "edit") {
      fillClientForm(client);
      if (clientModalTitle) clientModalTitle.textContent = "Edit Client";
      if (clientModalDescription) {
        clientModalDescription.textContent =
          "Update the selected client's main CRM details. Notes stay managed inside client details.";
      }
      if (saveClientButton) saveClientButton.textContent = "Save Changes";
      if (clientNotesField) clientNotesField.hidden = true;
      return;
    }

    form.reset();
    form.elements.timezone.value = "";
    form.elements.status.dispatchEvent(new Event("change", { bubbles: true }));
    if (clientModalTitle) clientModalTitle.textContent = "Add Client";
    if (clientModalDescription) {
      clientModalDescription.textContent =
        "Add the main client details now. Notes can be added here or managed later from client details.";
    }
    if (saveClientButton) saveClientButton.textContent = "Save Client";
    if (clientNotesField) clientNotesField.hidden = false;
  };

  const openEditClientModal = (clientId) => {
    const client = getClientById(clientId);

    if (!client) return;

    setClientFormMode("edit", client);
    openClientModalButton?.click();
  };

  const closeClientModal = () => {
    document.querySelector("#client-modal [data-modal-close]")?.click();
  };

  const openDeleteModal = () => {
    if (!deleteModal) return;

    deleteModal.hidden = false;
    deleteModal.dataset.modalState = "open";
    deleteModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const closeDeleteModal = () => {
    if (!deleteModal) return;

    deleteModal.hidden = true;
    deleteModal.dataset.modalState = "closed";
    deleteModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  const setActiveStatusFilter = (selectedButton) => {
    /* --- Final listeners connect filters, retry, reminders, and initial page load. --- */
    statusFilters.forEach((button) => {
      button.classList.toggle("filter-chip--active", button === selectedButton);
    });

    activeStatus = selectedButton?.dataset.statusFilter || "all";
    renderClients();
  };

  form?.elements.phone?.addEventListener("input", () => {
    const detected = detectClientTimezone(form.elements.phone.value);
    const timezoneSelect = form.elements.timezone;

    if (detected && timezoneSelect && !timezoneSelect.value) {
      timezoneSelect.value = detected.timezone;
    }
  });

  /* --- Add and Edit Client Submit Flow --- */
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const draft = formHelpers.getFormClient(form);

    if (!formHelpers.validateClient(form, draft, clients, editingClientId)) return;

    if (editingClientId) {
      setButtonLoading(saveClientButton, true, "Saving...");

      try {
        const apiClient = await data.updateClientRequest?.(editingClientId, draft);
        updateClient(
          editingClientId,
          (client) =>
            normalizeClient({
              ...client,
              ...(apiClient || {}),
              name: draft.name,
              company: draft.company,
              email: draft.email,
              phone: draft.phone,
              country: draft.country,
              timezone: draft.timezone,
              status: draft.status,
              dealValue: draft.dealValue,
            }),
          false,
        );

        const updatedClient = getClientById(editingClientId);
        if (detailsContent?.dataset.activeClientId === String(editingClientId)) {
          renderClientDetails(updatedClient);
        }

        renderClients();
        setClientFormMode("add");
        closeClientModal();
        logClientActivity({
          title: `${updatedClient.name} client details updated`,
          summary: `${updatedClient.company || "No company"} - ${data.formatStatus(updatedClient.status)}`,
          status: "Updated",
          relatedLabel: updatedClient.name,
          description: "Client main information was edited from the client manager modal.",
          details: [
            ["Company", updatedClient.company || "No company"],
            ["Email", updatedClient.email || "No email"],
            ["Status", data.formatStatus(updatedClient.status)],
          ],
        });
        window.crmToast?.show("Client updated successfully.", "success");
      } catch (updateError) {
        window.crmToast?.show(getAsyncErrorMessage(updateError, "Client could not be updated."), "error");
      } finally {
        setButtonLoading(saveClientButton, false);
        if (!editingClientId && saveClientButton) saveClientButton.textContent = "Save Client";
      }

      return;
    }

    setButtonLoading(saveClientButton, true, "Adding...");

    try {
      const apiClient = await data.postClient(draft);
      const client = normalizeClient({
        ...(apiClient || draft),
        notes: draft.notes.map((note) => ({
          id: createId("note"),
          text: note.text,
          author: getCurrentUserName(),
          date: note.date || new Date().toLocaleString(),
          status: "",
          taskId: "",
          taskTitle: "",
        })),
        createdAt: apiClient?.createdAt || new Date().toISOString(),
      });

      clients.unshift(client);
      saveClients();
      renderClients();
      setClientFormMode("add");
      closeClientModal();
      logClientActivity({
        title: `${client.name} added as a client`,
        summary: `${client.company || "No company"} - ${data.formatStatus(client.status)}`,
        status: "Created",
        relatedLabel: client.name,
        description: "A new client was added from the Add Client modal.",
        details: [
          ["Company", client.company || "No company"],
          ["Email", client.email || "No email"],
          ["Deal value", moneyFormatter.format(client.dealValue)],
        ],
      });
      window.crmToast?.show("Client added successfully.", "success");
    } catch (addError) {
      window.crmToast?.show(getAsyncErrorMessage(addError, "Client could not be added."), "error");
    } finally {
      setButtonLoading(saveClientButton, false);
    }
  });

  /* --- Client List Event Delegation --- */
  list.addEventListener("change", (event) => {
    const checkbox = event.target.closest(".js-client-select");

    if (!checkbox) return;

    const clientId = String(checkbox.value);

    if (checkbox.checked) {
      selectedClientIds.add(clientId);
    } else {
      selectedClientIds.delete(clientId);
    }

    renderSelectionBar();
  });

  list.addEventListener("click", (event) => {
    if (event.target.closest(".js-client-select")) return;

    const deleteButton = event.target.closest(".js-delete-client");
    const actionButton = event.target.closest("[data-client-action]");
    const card = event.target.closest(".client-card");

    if (!card) return;

    if (actionButton?.dataset.clientAction === "edit") {
      openEditClientModal(card.dataset.clientId);
      return;
    }

    if (deleteButton) {
      pendingDeleteId = card.dataset.clientId || null;

      if (pendingDeleteId) {
        openDeleteModal();
      }

      return;
    }

    if (actionButton && actionButton.dataset.clientAction !== "view") return;

    openClientDetails(card.dataset.clientId);
  });

  /* --- Client Notes and Reminders --- */
  noteForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const activeClientId = detailsContent?.dataset.activeClientId;
    const text = noteTextInput?.value.trim() || "";
    let taskId = noteTaskSelect?.value || "";
    let taskTitle = noteTaskSelect?.selectedOptions?.[0]?.textContent || "";
    const shouldCreateTask = taskId === "__create_new_task__";
    const newTaskTitle = noteNewTaskInput?.value.trim() || "";
    const activeClient = getClientById(activeClientId);

    if (noteError) {
      noteError.hidden = true;
      noteError.textContent = "";
    }

    if (!activeClientId) return;

    if (!text) {
      if (noteError) {
        noteError.textContent = "Please write a note before saving.";
        noteError.hidden = false;
      }
      return;
    }

    if (shouldCreateTask && newTaskTitle.length < 3) {
      if (noteError) {
        noteError.textContent = "New task title must be at least 3 characters.";
        noteError.hidden = false;
      }
      return;
    }

    if (shouldCreateTask) {
      const newTask = {
        id: createId("task"),
        title: newTaskTitle,
        client: activeClient?.name || "No client",
        description: text,
        dueDate: "Today",
        dueAt: "",
        priority: "Medium",
        status: "todo",
        assignee: getCurrentUserName(),
        subtasks: [],
        comments: [],
        archived: false,
        deleted: false,
        deletedAt: "",
        createdAt: new Date().toISOString(),
      };

      saveStoredTasks([...getStoredTasks(), newTask]);
      taskId = newTask.id;
      taskTitle = newTask.title;
    }

    const note = {
      id: createId("note"),
      text,
      author: getCurrentUserName(),
      date: new Date().toLocaleString(),
      status: noteStatusSelect?.value || "",
      taskId,
      taskTitle: taskId ? taskTitle : "",
    };

    updateClient(activeClientId, (client) => ({
      ...client,
      notes: [...(Array.isArray(client.notes) ? client.notes : []), note],
    }));

    const updatedClient = getClientById(activeClientId);
    noteForm.reset();
    if (noteStatusSelect) noteStatusSelect.value = "";
    toggleNewTaskField();
    renderClientDetails(updatedClient);
    renderClients();
    logClientActivity({
      type: "note",
      icon: "chat",
      title: `${note.author} added a note for ${updatedClient?.name || "client"}`,
      summary: note.status ? `Status: ${data.formatStatus(note.status)}` : text.slice(0, 90),
      status: note.status ? data.formatStatus(note.status) : "No status",
      relatedLabel: updatedClient?.name || "Client",
      description: text,
      actionHref: note.taskId ? "./dashboard.html#tasks" : "./clients.html",
      actionLabel: note.taskId ? "Open Task Board" : "Open Clients",
      details: [
        ["Client", updatedClient?.name || "Unknown client"],
        ["Author", note.author],
        ["Attached task", note.taskTitle || "No task attached"],
      ],
    });
    window.crmToast?.show("Client note added.", "success");
  });

  clientStatusForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const activeClientId = detailsContent?.dataset.activeClientId;
    const nextStatus = clientStatusSelect?.value || "lead";

    if (!activeClientId) return;

    updateClient(activeClientId, (client) => ({
      ...client,
      status: nextStatus,
    }));

    const updatedClient = getClientById(activeClientId);
    renderClientDetails(updatedClient);
    renderClients();
    logClientActivity({
      title: `${updatedClient?.name || "Client"} status changed`,
      summary: `Client status changed to ${data.formatStatus(nextStatus)}.`,
      status: data.formatStatus(nextStatus),
      relatedLabel: updatedClient?.name || "Client",
      description: "Client pipeline status was updated from the client details modal.",
      details: [["New status", data.formatStatus(nextStatus)]],
    });
    window.crmToast?.show(`Client status changed to ${data.formatStatus(nextStatus)}.`, "success");
  });

  /* --- Validate and save a follow-up reminder for the selected client. --- */

  setReminderButton?.addEventListener("click", () => {
    const activeClientId = detailsContent?.dataset.activeClientId;
    const selectedValue = reminderInput?.value || "";
    const reminderDate = new Date(selectedValue);

    if (!activeClientId || !reminderInput || !reminderStatus) return;

    if (!selectedValue || Number.isNaN(reminderDate.getTime())) {
      reminderStatus.textContent = "Please choose a valid reminder date and time.";
      reminderStatus.dataset.state = "error";
      window.crmToast?.show("Please choose a valid reminder date and time.", "error");
      return;
    }

    if (reminderDate.getTime() <= Date.now()) {
      reminderStatus.textContent = "Reminder time must be in the future.";
      reminderStatus.dataset.state = "error";
      window.crmToast?.show("Reminder time must be in the future.", "error");
      return;
    }

    updateClient(activeClientId, (client) => ({
      ...client,
      reminderAt: reminderDate.toISOString(),
      reminderNotified: false,
    }));

    const updatedClient = getClientById(activeClientId);
    renderReminderState(updatedClient);
    renderClients();
    logClientActivity({
      type: "reminder",
      icon: "calendar",
      title: `Reminder set for ${updatedClient?.name || "client"}`,
      summary: `Reminder set for ${formatReminderDate(updatedClient.reminderAt)}.`,
      status: "Scheduled",
      relatedLabel: updatedClient?.name || "Client",
      description: "A follow-up reminder was scheduled from the client details modal.",
      details: [
        ["Client", updatedClient?.name || "Unknown client"],
        ["Reminder time", formatReminderDate(updatedClient.reminderAt)],
      ],
    });
    window.crmToast?.show(`Reminder set for ${formatReminderDate(updatedClient.reminderAt)}.`, "success");
  });

  noteTaskSelect?.addEventListener("change", toggleNewTaskField);

  notesList?.addEventListener("click", (event) => {
    const deleteNoteButton = event.target.closest(".js-delete-client-note");

    if (deleteNoteButton) {
      const activeClientId = detailsContent?.dataset.activeClientId;
      const noteId = deleteNoteButton.dataset.noteId || "";
      const note = getNoteById(activeClientId, noteId);

      if (!note) return;

      pendingNoteDeleteId = noteId;
      openNoteDeleteModal(note);
      return;
    }

    const editStatusButton = event.target.closest(".js-edit-note-status");

    if (editStatusButton) {
      const noteId = editStatusButton.dataset.noteId || "";
      const editor = notesList.querySelector(`.js-note-status-editor[data-note-id="${CSS.escape(noteId)}"]`);

      if (!editor) return;

      editor.hidden = false;
      editStatusButton.hidden = true;
      editor.querySelector(".js-note-status-select")?.focus({ preventScroll: true });
      return;
    }

    const cancelStatusButton = event.target.closest(".js-cancel-note-status");

    if (cancelStatusButton) {
      const editor = cancelStatusButton.closest(".js-note-status-editor");
      const noteId = editor?.dataset.noteId || "";
      const editButton = notesList.querySelector(`.js-edit-note-status[data-note-id="${CSS.escape(noteId)}"]`);

      if (editor) editor.hidden = true;
      if (editButton) editButton.hidden = false;
      return;
    }

    const taskButton = event.target.closest(".js-open-attached-task");
    const taskId = taskButton?.dataset.taskId;

    if (!taskId) return;

    sessionStorage.setItem(PENDING_TASK_KEY, taskId);
    window.location.href = "./dashboard.html#tasks";
  });

  notesList?.addEventListener("submit", (event) => {
    const editor = event.target.closest(".js-note-status-editor");

    if (!editor) return;

    event.preventDefault();

    const activeClientId = detailsContent?.dataset.activeClientId;
    const noteId = editor.dataset.noteId || "";
    const nextStatus = editor.querySelector(".js-note-status-select")?.value || "";

    if (!activeClientId || !noteId) return;

    updateNoteStatus(activeClientId, noteId, nextStatus);

    const updatedClient = getClientById(activeClientId);
    const updatedNote = getNoteById(activeClientId, noteId);
    renderClientDetails(updatedClient);
    renderClients();
    logClientActivity({
      type: "note",
      icon: "chat",
      title: `Note status updated for ${updatedClient?.name || "client"}`,
      summary: `Note status changed to ${nextStatus ? data.formatStatus(nextStatus) : "No status"}.`,
      status: nextStatus ? data.formatStatus(nextStatus) : "No status",
      relatedLabel: updatedClient?.name || "Client",
      description: updatedNote?.text || "Client note status was updated.",
      details: [
        ["Client", updatedClient?.name || "Unknown client"],
        ["Note status", nextStatus ? data.formatStatus(nextStatus) : "No status"],
      ],
    });
    window.crmToast?.show("Note status updated.", "success");
  });

  confirmDeleteNoteButton?.addEventListener("click", () => {
    const activeClientId = detailsContent?.dataset.activeClientId;

    if (!activeClientId || !pendingNoteDeleteId) return;

    const deletedNote = getNoteById(activeClientId, pendingNoteDeleteId);

    updateClient(activeClientId, (client) => ({
      ...client,
      notes: (Array.isArray(client.notes) ? client.notes : []).filter(
        (note) => String(note.id) !== String(pendingNoteDeleteId),
      ),
    }));

    const updatedClient = getClientById(activeClientId);
    closeNoteDeleteModal();
    renderClientDetails(updatedClient);
    renderClients();
    logClientActivity({
      type: "note",
      icon: "chat",
      title: `Note deleted for ${updatedClient?.name || "client"}`,
      summary: deletedNote?.status
        ? `Deleted note had ${data.formatStatus(deletedNote.status)} status.`
        : "Client note deleted.",
      status: "Deleted",
      relatedLabel: updatedClient?.name || "Client",
      description: deletedNote?.text || "A client note was deleted.",
      details: [["Client", updatedClient?.name || "Unknown client"]],
    });
    window.crmToast?.show("Client note deleted.", "success");
  });

  noteDeleteModal?.querySelectorAll(".js-close-note-delete").forEach((button) => {
    button.addEventListener("click", closeNoteDeleteModal);
  });

  /* --- Client Delete Flow --- */
  confirmDeleteButton?.addEventListener("click", async () => {
    if (!pendingDeleteId) return;

    setButtonLoading(confirmDeleteButton, true, "Deleting...");

    try {
      await data.deleteClientRequest(pendingDeleteId);
      const deletedClient = getClientById(pendingDeleteId);
      clients = clients.filter((client) => String(client.id) !== String(pendingDeleteId));
      selectedClientIds.delete(String(pendingDeleteId));
      saveClients();
      renderClients();
      closeDeleteModal();
      logClientActivity({
        title: `${deletedClient?.name || "Client"} deleted`,
        summary: `${deletedClient?.company || "Client record"} was removed from the clients list.`,
        status: "Deleted",
        relatedLabel: deletedClient?.name || "Client",
        description: "A client record was deleted from the clients page.",
        details: [["Client", deletedClient?.name || "Unknown client"]],
      });
      window.crmToast?.show("Client deleted.", "success");
    } catch (deleteError) {
      window.crmToast?.show(getAsyncErrorMessage(deleteError, "Client could not be deleted."), "error");
    } finally {
      setButtonLoading(confirmDeleteButton, false);
      pendingDeleteId = null;
    }
  });

  deleteSelectedButton?.addEventListener("click", async () => {
    const selectedIds = Array.from(selectedClientIds);

    if (!selectedIds.length) {
      window.crmToast?.show("Choose at least one client to delete.", "info");
      return;
    }

    setButtonLoading(deleteSelectedButton, true, "Deleting...");

    try {
      const deletedClients = selectedIds.map((clientId) => getClientById(clientId)).filter(Boolean);

      await Promise.all(selectedIds.map((clientId) => data.deleteClientRequest(clientId)));

      clients = clients.filter((client) => !selectedClientIds.has(String(client.id)));
      clearClientSelection();
      saveClients();
      renderClients();
      logClientActivity({
        title: "Selected clients deleted",
        summary: `${deletedClients.length} clients were removed from the clients list.`,
        status: "Deleted",
        relatedLabel: "Clients",
        description: "Bulk selection was used to delete multiple client records.",
        details: [["Deleted clients", String(deletedClients.length)]],
      });
      window.crmToast?.show(`${deletedClients.length} selected clients deleted.`, "success");
    } catch (bulkDeleteError) {
      window.crmToast?.show(getAsyncErrorMessage(bulkDeleteError, "Selected clients could not be deleted."), "error");
    } finally {
      setButtonLoading(deleteSelectedButton, false);
    }
  });

  deleteModal?.querySelectorAll("[data-modal-close]").forEach((button) => {
    button.addEventListener("click", () => {
      pendingDeleteId = null;
      closeDeleteModal();
    });
  });

  openClientModalButton?.addEventListener("click", () => {
    if (!editingClientId) setClientFormMode("add");
  });

  document.querySelectorAll("#client-modal [data-modal-close]").forEach((button) => {
    button.addEventListener("click", () => setClientFormMode("add"));
  });

  retryButton?.addEventListener("click", loadClients);
  importClientsButtons.forEach((button) => button.addEventListener("click", importStarterClients));
  selectVisibleButton?.addEventListener("click", selectVisibleClients);
  clearSelectionButton?.addEventListener("click", clearClientSelection);
  searchInput?.addEventListener("input", renderClients);
  sortSelect?.addEventListener("change", renderClients);
  statusFilters.forEach((button) => {
    button.addEventListener("click", () => setActiveStatusFilter(button));
  });

  window.setInterval(checkClientReminders, 30000);
  loadClients();
}
