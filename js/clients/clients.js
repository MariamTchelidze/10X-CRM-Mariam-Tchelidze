"use strict";

const clientsPage = document.querySelector(".clientsPage");

initClients();

function initClients() {
  if (!clientsPage) return;

  const constants = window.crmConstants;
  const storage = window.crmStorage;
  const data = window.crmData;
  const cards = window.crmClientCards;
  const formHelpers = window.crmClientForm;

  if (!constants || !storage || !data || !cards || !formHelpers) return;

  const list = document.getElementById("clients-list");
  const loading = document.getElementById("clients-loading");
  const error = document.getElementById("clients-error");
  const empty = document.getElementById("clients-empty");
  const form = document.querySelector(".js-client-form");
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

  if (!list) return;

  let clients = storage.read(constants.CLIENTS_KEY, []);
  let activeStatus = "all";
  let pendingDeleteId = null;
  let pendingNoteDeleteId = null;
  const TASKS_KEY = "crm_tasks";

  const moneyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const getSummaryElement = (id) => document.getElementById(id);

  const escapeHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const PENDING_TASK_KEY = "crm_pending_open_task";
  const NOTE_STATUSES = [
    { value: "", label: "No status" },
    { value: "reviewed", label: "Reviewed" },
    { value: "approved", label: "Approved" },
    { value: "declined", label: "Declined" },
    { value: "processed", label: "Processed" },
  ];

  const setDetailText = (selector, value) => {
    const element = detailsModal?.querySelector(selector);
    if (element) element.textContent = value;
  };

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

  const getNoteCountLabel = (count) => `${count} ${count === 1 ? "note" : "notes"}`;

  const getNoteById = (clientId, noteId) => {
    const client = getClientById(clientId);
    const notes = Array.isArray(client?.notes) ? client.notes : [];

    return notes.find((note) => String(note.id) === String(noteId)) || null;
  };

  const openNoteDeleteModal = (note) => {
    if (!noteDeleteModal || !noteDeleteMessage || !note) return;

    const attachedTask = note.taskId
      ? getStoredTasks().find((task) => String(task.id) === String(note.taskId))
      : null;
    const noteStatus = note.status || "";
    const processedStatus = noteStatus === "processed" || attachedTask?.status === "done"
      ? noteStatus || "done"
      : noteStatus;
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

  const renderNoteStatusOptions = (selectedStatus = "") => {
    return NOTE_STATUSES.map((status) => {
      const selected = status.value === selectedStatus ? " selected" : "";

      return `<option value="${escapeHtml(status.value)}"${selected}>${escapeHtml(status.label)}</option>`;
    }).join("");
  };

  const updateNoteStatus = (clientId, noteId, nextStatus) => {
    updateClient(clientId, (client) => ({
      ...client,
      notes: (Array.isArray(client.notes) ? client.notes : []).map((note) =>
        String(note.id) === String(noteId) ? { ...note, status: nextStatus } : note,
      ),
    }));
  };

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

  const updateClient = (clientId, updater) => {
    clients = clients.map((client) =>
      String(client.id) === String(clientId) ? updater(client) : client,
    );
    saveClients();
  };

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
    setDetailText("[data-details-value]", moneyFormatter.format(Number(client.dealValue) || 0));
    setDetailText("[data-details-note-count]", getNoteCountLabel(notes.length));
    setDetailText("[data-details-note-count-inline]", getNoteCountLabel(notes.length));
    renderClientNotes(notes);
    renderTaskOptions();
    if (noteError) noteError.hidden = true;

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


  const setLoading = (isLoading) => {
    if (loading) loading.hidden = !isLoading;
    if (error) error.hidden = true;
    if (empty && isLoading) empty.hidden = true;
  };

  const setError = () => {
    if (loading) loading.hidden = true;
    if (error) error.hidden = false;
    if (empty) empty.hidden = true;
  };

  const saveClients = () => {
    storage.write(constants.CLIENTS_KEY, clients);
  };

  const updateSummary = () => {
    getSummaryElement("clients-count-total").textContent = clients.length;
    getSummaryElement("clients-count-lead").textContent = clients.filter((client) => client.status === "lead").length;
    getSummaryElement("clients-count-contacted").textContent = clients.filter((client) => client.status === "contacted").length;
    getSummaryElement("clients-count-won").textContent = clients.filter((client) => client.status === "won").length;
  };

  const getFilteredClients = () => {
    const query = String(searchInput?.value || "").trim().toLowerCase();
    const sortValue = sortSelect?.value || "created-desc";

    const filteredClients = clients.filter((client) => {
      const matchesStatus = activeStatus === "all" || client.status === activeStatus;
      const searchableText = [client.name, client.company, client.email, client.phone].join(" ").toLowerCase();
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

  const renderClients = () => {
    const visibleClients = getFilteredClients();

    list.innerHTML = "";
    visibleClients.forEach((client) => list.append(cards.renderClientCard(client)));

    if (empty) {
      empty.hidden = visibleClients.length > 0;
    }

    updateSummary();
  };

  const loadClients = async () => {
    if (clients.length) {
      renderClients();
      return;
    }

    setLoading(true);

    try {
      clients = await data.fetchInitialClients();
      saveClients();
      renderClients();
      setLoading(false);
    } catch (error) {
      setError();
      window.crmToast?.show("Could not load clients. Check your connection and try again.", "error");
    }
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
    statusFilters.forEach((button) => {
      button.classList.toggle("filter-chip--active", button === selectedButton);
    });

    activeStatus = selectedButton?.dataset.statusFilter || "all";
    renderClients();
  };

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const draft = formHelpers.getFormClient(form);

    if (!formHelpers.validateClient(form, draft, clients)) return;

    try {
      const apiClient = await data.postClient(draft);
      const client = {
        ...draft,
        id: apiClient.id || window.crypto?.randomUUID?.() || Date.now(),
        createdAt: new Date().toISOString(),
      };

      clients.unshift(client);
      saveClients();
      renderClients();
      form.reset();
      closeClientModal();
      window.crmToast?.show("Client added successfully.", "success");
    } catch (error) {
      window.crmToast?.show("Client could not be added.", "error");
    }
  });

  list.addEventListener("click", (event) => {
    const deleteButton = event.target.closest(".js-delete-client");
    const actionButton = event.target.closest("[data-client-action]");
    const card = event.target.closest(".client-card");

    if (!card) return;

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
    window.crmToast?.show("Client note added.", "success");
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
    renderClientDetails(updatedClient);
    renderClients();
    window.crmToast?.show("Note status updated.", "success");
  });

  confirmDeleteNoteButton?.addEventListener("click", () => {
    const activeClientId = detailsContent?.dataset.activeClientId;

    if (!activeClientId || !pendingNoteDeleteId) return;

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
    window.crmToast?.show("Client note deleted.", "success");
  });

  noteDeleteModal?.querySelectorAll(".js-close-note-delete").forEach((button) => {
    button.addEventListener("click", closeNoteDeleteModal);
  });

  confirmDeleteButton?.addEventListener("click", async () => {
    if (!pendingDeleteId) return;

    try {
      await data.deleteClientRequest(pendingDeleteId);
      clients = clients.filter((client) => String(client.id) !== String(pendingDeleteId));
      saveClients();
      renderClients();
      closeDeleteModal();
      window.crmToast?.show("Client deleted.", "success");
    } catch (error) {
      window.crmToast?.show("Client could not be deleted.", "error");
    } finally {
      pendingDeleteId = null;
    }
  });

  deleteModal?.querySelectorAll("[data-modal-close]").forEach((button) => {
    button.addEventListener("click", () => {
      pendingDeleteId = null;
      closeDeleteModal();
    });
  });

  retryButton?.addEventListener("click", loadClients);
  searchInput?.addEventListener("input", renderClients);
  sortSelect?.addEventListener("change", renderClients);
  statusFilters.forEach((button) => {
    button.addEventListener("click", () => setActiveStatusFilter(button));
  });

  loadClients();
}
