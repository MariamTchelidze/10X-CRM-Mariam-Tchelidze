"use strict";

const taskWorkspacePage = document.querySelector(".dashboardPage");
const taskSummaryPage = document.querySelector(".profilePage");

initTasks();

function initTasks() {
  const board = document.querySelector(".js-task-board");
  const summary = document.querySelector(".js-task-summary");

  if (!board && !summary) return;

  const TASKS_KEY = "crm_tasks";
  const NOTIFICATIONS_KEY = "crm_task_notifications";
  const PENDING_TASK_KEY = "crm_pending_open_task";
  const CURRENT_USER = "Mariam Tchelidze";
  const statuses = ["todo", "in-progress", "overdue", "done"];
  const statusLabels = {
    todo: "To Do",
    "in-progress": "In Progress",
    overdue: "Overdue",
    done: "Done",
  };

  const priorityColors = {
    High: "#ee5c4c",
    Medium: "#ff6b1a",
    Low: "#4c8fea",
  };

  const getPriorityColor = (priority) => priorityColors[priority] || priorityColors.Low;
  const defaultTasks = [
    {
      id: "task-follow-up",
      title: "Follow up with Alpha Group",
      client: "Alpha Group",
      description: "Send pricing notes after the product demo.",
      dueDate: "Today",
      priority: "High",
      assignee: "Mariam Tchelidze",
      color: "#ee5c4c",
      subtasks: [
        { id: "subtask-follow-up-1", text: "Prepare notes", done: true },
        { id: "subtask-follow-up-2", text: "Send pricing email", done: false },
      ],
      comments: [],
      status: "todo",
      archived: false,
    },
    {
      id: "task-contract",
      title: "Prepare contract draft",
      client: "Nova Studio",
      description: "Move proposal details into the agreement template.",
      dueDate: "Tomorrow",
      priority: "Medium",
      assignee: "Sales Team",
      color: "#ff6b1a",
      subtasks: [
        { id: "subtask-contract-1", text: "Collect company details", done: false },
        { id: "subtask-contract-2", text: "Draft agreement", done: false },
      ],
      comments: [],
      status: "in-progress",
      archived: false,
    },
    {
      id: "task-overdue-report",
      title: "Send overdue report",
      client: "Internal",
      description: "Share last week's sales report with the team.",
      dueDate: "Overdue by 2 days",
      priority: "High",
      assignee: "Account Manager",
      color: "#ee5c4c",
      subtasks: [
        { id: "subtask-overdue-1", text: "Export report", done: true },
        { id: "subtask-overdue-2", text: "Send summary", done: false },
      ],
      comments: [],
      status: "overdue",
      archived: false,
    },
    {
      id: "task-update-profile",
      title: "Update CRM profile",
      client: "10X CRM Demo",
      description: "Check profile details and avatar preview.",
      dueDate: "Completed",
      priority: "Low",
      assignee: "Mariam Tchelidze",
      color: "#4c8fea",
      subtasks: [
        { id: "subtask-profile-1", text: "Review profile", done: true },
        { id: "subtask-profile-2", text: "Save updates", done: true },
      ],
      comments: [],
      status: "done",
      archived: false,
    },
  ];

  let activeTaskId = null;
  let draggedTaskId = null;
  let pendingDeleteTaskId = null;
  let editingSubtaskId = null;

  const addTaskForm = document.querySelector(".js-add-task-form");
  const addTaskStatus = document.querySelector(".js-add-task-status");
  const detailsModal = document.getElementById("task-details-modal");
  const detailsForm = document.querySelector(".js-task-details-form");
  const commentsForm = document.querySelector(".js-task-comment-form");
  const addSubtaskForm = document.querySelector(".js-add-subtask-form");

  const readJson = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return Array.isArray(value) ? value : fallback;
    } catch (error) {
      return fallback;
    }
  };

  const saveJson = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // The UI still updates for this page even if storage is unavailable.
    }
  };

  const createId = (prefix) => {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `${prefix}-${window.crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  const normalizeSubtask = (subtask) => {
    if (typeof subtask === "string") {
      return { id: createId("subtask"), text: subtask, done: false };
    }

    return {
      id: subtask.id || createId("subtask"),
      text: subtask.text || "",
      done: Boolean(subtask.done),
    };
  };

  const normalizeTask = (task) => {
    return {
      ...task,
      color: getPriorityColor(task.priority),
      subtasks: Array.isArray(task.subtasks) ? task.subtasks.map(normalizeSubtask).filter((item) => item.text) : [],
      comments: Array.isArray(task.comments) ? task.comments : [],
      archived: Boolean(task.archived),
      deleted: Boolean(task.deleted),
      deletedAt: task.deletedAt || "",
      dueAt: task.dueAt || "",
    };
  };

  let tasks = readJson(TASKS_KEY, defaultTasks).map(normalizeTask);
  let notifications = readJson(NOTIFICATIONS_KEY, []);

  const saveTasks = () => saveJson(TASKS_KEY, tasks);
  const saveNotifications = () => saveJson(NOTIFICATIONS_KEY, notifications);

  const getActiveTasks = () => tasks.filter((task) => !task.archived && !task.deleted);
  const getArchivedTasks = () => tasks.filter((task) => task.archived && !task.deleted);
  const getDeletedTasks = () => tasks.filter((task) => task.deleted);
  const getTaskById = (taskId) => tasks.find((task) => task.id === taskId);

  const escapeHtml = (value) => {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  };

  const getInitials = (name) => {
    return String(name || "Unassigned")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "NA";
  };
  const formatDueDate = (value) => {
    if (!value) return "No due date";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (value) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Just now";

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const addNotification = (message, taskId = "") => {
    notifications = [
      {
        id: createId("notification"),
        message,
        taskId,
        read: false,
        status: "unread",
        selected: false,
        createdAt: new Date().toISOString(),
      },
      ...notifications,
    ];
    saveNotifications();
    renderNotifications();
  };

  const getTaskCounts = () => {
    return getActiveTasks().reduce(
      (counts, task) => {
        if (statuses.includes(task.status)) {
          counts[task.status] += 1;
        }
        return counts;
      },
      { todo: 0, "in-progress": 0, overdue: 0, done: 0 },
    );
  };

  const getChecklistProgress = (task) => {
    const total = task.subtasks.length;
    const done = task.subtasks.filter((subtask) => subtask.done).length;
    return { done, total };
  };

  const getSubtasksMarkup = (task) => {
    const { done, total } = getChecklistProgress(task);

    if (!total) return "";

    return `<p class="task-card__meta">${done}/${total} checklist done</p>`;
  };

  const createTaskCard = (task) => {
    const card = document.createElement("article");
    const color = getPriorityColor(task.priority);

    card.className = `task-card task-card--${task.status} task-card--priority-${String(task.priority).toLowerCase()}`;
    card.draggable = true;
    card.dataset.taskId = task.id;
    card.style.setProperty("--task-accent", color);
    card.innerHTML = `
      <header class="task-card__header">
        <div>
          <h4 class="task-card__title">${escapeHtml(task.title)}</h4>
          <p class="task-card__client">${escapeHtml(task.client)}</p>
        </div>
        <span class="task-card__status">${statusLabels[task.status]}</span>
      </header>
      <p class="task-card__description">${escapeHtml(task.description || "No description added.")}</p>
      ${getSubtasksMarkup(task)}
      <footer class="task-card__footer">
        <div class="task-card__meta-group">
          <span class="task-card__date">${escapeHtml(task.dueDate)}</span>
          <span class="task-card__priority">${escapeHtml(task.priority)}</span>
        </div>
        <div class="task-card__assignee" title="Assigned to ${escapeHtml(task.assignee || "Unassigned")}">
          <span class="task-card__avatar" aria-label="Assigned to ${escapeHtml(task.assignee || "Unassigned")}">
            ${escapeHtml(getInitials(task.assignee))}
          </span>
        </div>
      </footer>
      <div class="task-card__actions" aria-label="Task actions">
        <button class="task-card__button task-card__button--primary" type="button" data-task-action="open">Open</button>
        <button class="task-card__button" type="button" data-task-action="archive">Archive</button>
        <button class="task-card__button task-card__button--danger" type="button" data-task-action="delete">Delete</button>
      </div>
    `;
    return card;
  };

  const renderSummary = () => {
    const counts = getTaskCounts();

    document.querySelectorAll("[data-task-summary]").forEach((item) => {
      const status = item.dataset.taskSummary;
      item.textContent = String(counts[status] || 0);
    });
  };

  const renderArchive = () => {
    const archiveList = document.querySelector(".js-task-archive-list");
    const archiveCount = document.querySelector(".js-task-archive-count");
    const archivedTasks = getArchivedTasks();

    if (archiveCount) {
      archiveCount.textContent = `${archivedTasks.length} archived`;
    }

    if (!archiveList) return;

    if (!archivedTasks.length) {
      archiveList.innerHTML = '<p class="task-empty">No archived tasks yet.</p>';
      return;
    }

    archiveList.innerHTML = "";
    archivedTasks.forEach((task) => {
      const item = document.createElement("article");
      item.className = "task-archive-item";
      item.dataset.taskId = task.id;
      item.innerHTML = `
        <div>
          <h4 class="task-archive-item__title">${escapeHtml(task.title)}</h4>
          <p class="task-archive-item__meta">${escapeHtml(task.client)} | ${statusLabels[task.status]}</p>
        </div>
        <div class="task-archive-item__actions">
          <button class="task-card__button" type="button" data-task-action="open">Open</button>
          <button class="task-card__button" type="button" data-task-action="restore">Restore</button>
          <button class="task-card__button task-card__button--danger" type="button" data-task-action="delete">Delete</button>
        </div>
      `;
      archiveList.append(item);
    });
  };

  const renderBoard = () => {
    const counts = getTaskCounts();

    document.querySelectorAll(".js-task-dropzone").forEach((dropzone) => {
      const status = dropzone.dataset.taskDropzone;
      const matchingTasks = getActiveTasks().filter((task) => task.status === status);
      dropzone.innerHTML = "";

      if (!matchingTasks.length) {
        dropzone.innerHTML = '<p class="task-empty">No tasks here.</p>';
      } else {
        matchingTasks.forEach((task) => dropzone.append(createTaskCard(task)));
      }
    });

    document.querySelectorAll("[data-task-count]").forEach((item) => {
      const status = item.dataset.taskCount;
      item.textContent = String(counts[status] || 0);
    });

    renderArchive();
  };


  const renderRecycleBin = () => {
    const recycleList = document.querySelector(".js-recycle-bin-list");
    const recycleCount = document.querySelector(".js-recycle-count");
    const deletedTasks = getDeletedTasks();

    if (recycleCount) {
      recycleCount.textContent = `${deletedTasks.length} deleted`;
    }

    if (!recycleList) return;

    if (!deletedTasks.length) {
      recycleList.innerHTML = '<p class="task-empty">Recycle bin is empty.</p>';
      return;
    }

    recycleList.innerHTML = "";
    deletedTasks.forEach((task) => {
      const item = document.createElement("article");
      item.className = "recycle-task-item";
      item.dataset.taskId = task.id;
      item.innerHTML = `
        <div>
          <h4 class="recycle-task-item__title">${escapeHtml(task.title)}</h4>
          <p class="recycle-task-item__meta">${escapeHtml(task.client)} | ${escapeHtml(task.priority)} | ${escapeHtml(task.dueDate)}</p>
        </div>
        <div class="recycle-task-item__actions">
          <button class="task-card__button task-card__button--primary" type="button" data-task-action="open">Open</button>
          <button class="task-card__button" type="button" data-task-action="restore-from-recycle">Restore</button>
          <button class="task-card__button task-card__button--danger" type="button" data-task-action="delete-permanent">Delete Permanently</button>
        </div>
      `;
      recycleList.append(item);
    });
  };
  const renderNotifications = () => {
    const unreadCount = notifications.filter((notification) => !(notification.read || notification.status === "read")).length;
    const counter = document.querySelector(".js-notification-count");
    const list = document.querySelector(".js-notification-list");

    if (counter) {
      counter.textContent = String(unreadCount);
      counter.hidden = unreadCount === 0;
    }

    if (!list) return;

    if (!notifications.length) {
      list.innerHTML = '<p class="task-empty">No notifications yet.</p>';
      return;
    }

    list.innerHTML = notifications
      .map(
        (notification) => `
          <article tabindex="0" role="button" class="notification-item js-notification-item${notification.read || notification.status === "read" ? "" : " notification-item--unread"}"
            data-notification-id="${notification.id}"
            data-notification-task-id="${escapeHtml(notification.taskId)}">
            <span class="notification-item__select" data-skip-delete-confirm>
              <input class="js-notification-select" type="checkbox" data-notification-id="${notification.id}" ${notification.selected ? "checked" : ""} aria-label="Select notification" />
            </span>
            <span class="notification-item__message">${escapeHtml(notification.message)}</span>
            <time class="notification-item__time">${formatDateTime(notification.createdAt)}</time>
          </article>`,
      )
      .join("");
  };

  const renderChecklist = (task) => {
    const checklist = document.querySelector(".js-task-checklist");
    const progress = document.querySelector(".js-task-checklist-progress");
    const { done, total } = getChecklistProgress(task);

    if (progress) {
      progress.textContent = `${done}/${total} done`;
    }

    if (!checklist) return;

    if (!total) {
      checklist.innerHTML = '<p class="task-empty">No checklist items yet.</p>';
      return;
    }

    checklist.innerHTML = task.subtasks
      .map(
        (subtask) => `
                    <div class="task-checklist__item" data-subtask-id="${subtask.id}">
            <input class="task-checklist__checkbox js-subtask-toggle" type="checkbox" ${subtask.done ? "checked" : ""} />
            ${
              editingSubtaskId === subtask.id
                ? `<input class="input task-checklist__edit-input js-subtask-edit-input" type="text" value="${escapeHtml(subtask.text)}" />`
                : `<span class="task-checklist__text">${escapeHtml(subtask.text)}</span>`
            }
            <div class="task-checklist__actions">
              ${
                editingSubtaskId === subtask.id
                  ? `<button class="task-card__button task-card__button--primary js-save-subtask" type="button">Save</button><button class="task-card__button js-cancel-subtask-edit" type="button">Cancel</button>`
                  : `<button class="task-card__button js-edit-subtask" type="button">Edit</button>`
              }
              <button class="task-card__button task-card__button--danger js-remove-subtask" type="button">Remove</button>
            </div>
          </div>
        `,
      )
      .join("");
  };

  const renderComments = (task) => {
    const commentsList = document.querySelector(".js-task-comments");
    const commentsCount = document.querySelector(".js-task-comment-count");

    if (commentsCount) {
      commentsCount.textContent = `${task.comments.length} comments`;
    }

    if (!commentsList) return;

    if (!task.comments.length) {
      commentsList.innerHTML = '<p class="task-empty">No comments yet.</p>';
      return;
    }

    commentsList.innerHTML = task.comments
      .map(
        (comment) => `
          <article class="task-comment">
            <header class="task-comment__header">
              <strong>${escapeHtml(comment.author)}</strong>
              <time>${formatDateTime(comment.createdAt)}</time>
            </header>
            ${comment.mention ? `<p class="task-comment__mention">@${escapeHtml(comment.mention)}</p>` : ""}
            <p class="task-comment__message">${escapeHtml(comment.message)}</p>
          </article>
        `,
      )
      .join("");
  };

  const renderTaskDetails = (task) => {
    if (!detailsForm || !task) return;

    detailsForm.querySelector(".js-task-detail-id").value = task.id;
    detailsForm.querySelector(".js-task-detail-title").value = task.title;
    detailsForm.querySelector(".js-task-detail-description").value = task.description || "";
    detailsForm.querySelector(".js-task-detail-assignee").value = task.assignee || "Unassigned";

    const assigneeControl = document.querySelector(".js-task-detail-assignee-control");
    const assigneeAvatar = document.querySelector(".js-task-detail-assignee-avatar");
    const assigneeName = document.querySelector(".js-task-detail-assignee-name");

    if (assigneeControl) {
      assigneeControl.value = task.assignee || "Mariam Tchelidze";
    }

    if (assigneeAvatar) {
      assigneeAvatar.textContent = getInitials(task.assignee);
    }

    if (assigneeName) {
      assigneeName.textContent = task.assignee || "Unassigned";
    }

    renderChecklist(task);
    renderComments(task);
  };

  const render = () => {
    if (taskWorkspacePage && board) {
      renderBoard();
      renderRecycleBin();
      renderNotifications();
    }

    if (taskSummaryPage || summary) {
      renderSummary();
    }

    if (activeTaskId) {
      renderTaskDetails(getTaskById(activeTaskId));
    }

    window.dispatchEvent(new CustomEvent("crm:tasks:update", { detail: { tasks } }));
  };

  const updateTask = (taskId, updates) => {
    tasks = tasks.map((task) => (task.id === taskId ? normalizeTask({ ...task, ...updates }) : task));
    saveTasks();
    render();
  };


  const parseTaskDeadline = (task) => {
    const rawValue = task.dueAt || task.dueDate;
    const date = new Date(rawValue);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const moveOverdueTasks = (now = new Date()) => {
    let changed = false;

    tasks = tasks.map((task) => {
      const deadline = parseTaskDeadline(task);

      if (
        !deadline ||
        task.status === "done" ||
        task.status === "overdue" ||
        task.archived ||
        task.deleted ||
        deadline.getTime() >= now.getTime()
      ) {
        return task;
      }

      changed = true;
      return normalizeTask({ ...task, status: "overdue" });
    });

    if (changed) {
      saveTasks();
      render();
    }
  };
  const openDeleteTaskModal = (taskId) => {
    pendingDeleteTaskId = taskId;
    document.querySelector(".js-open-delete-task-helper")?.click();
  };

  const moveTaskToRecycle = (taskId) => {
    updateTask(taskId, {
      archived: false,
      deleted: true,
      deletedAt: new Date().toISOString(),
    });
  };

  const deleteTaskPermanently = (taskId) => {
    tasks = tasks.filter((task) => task.id !== taskId);
    saveTasks();
    render();
  };

  const resetTasks = () => {
    tasks = defaultTasks.map(normalizeTask);
    saveTasks();
    render();
  };

  const openTaskDetails = (taskId) => {
    const task = getTaskById(taskId);

    if (!task || !detailsModal) return;

    activeTaskId = taskId;
    renderTaskDetails(task);
    document.querySelector(".js-open-task-details-helper")?.click();
  };

  const openPendingTaskFromClientNote = () => {
    if (!taskWorkspacePage || !board) return;

    const pendingTaskId = sessionStorage.getItem(PENDING_TASK_KEY);

    if (!pendingTaskId) return;

    sessionStorage.removeItem(PENDING_TASK_KEY);
    window.location.hash = "tasks";
    window.requestAnimationFrame(() => openTaskDetails(pendingTaskId));
  };

  const setFieldError = (fieldId, message) => {
    const errorElement = document.querySelector(`[data-error-for="${fieldId}"]`);
    const field = document.getElementById(fieldId);

    if (errorElement) {
      errorElement.textContent = message;
      errorElement.hidden = !message;
    }

    if (field) {
      field.classList.toggle("input--error", Boolean(message));
    }
  };

  const clearTaskFormErrors = () => {
    ["task-title", "task-client", "task-due-date", "task-priority"].forEach((fieldId) => {
      setFieldError(fieldId, "");
    });

    if (addTaskStatus) {
      addTaskStatus.hidden = true;
      addTaskStatus.textContent = "";
    }
  };

  const validateTaskForm = (formData) => {
    let isValid = true;

    clearTaskFormErrors();

    if (!formData.get("title").trim()) {
      setFieldError("task-title", "Please enter a task title.");
      isValid = false;
    }

    if (!formData.get("client").trim()) {
      setFieldError("task-client", "Please enter the client name.");
      isValid = false;
    }

    if (!formData.get("dueDate")) {
      setFieldError("task-due-date", "Please choose a due date.");
      isValid = false;
    }

    if (!formData.get("priority")) {
      setFieldError("task-priority", "Please choose task priority.");
      isValid = false;
    }

    return isValid;
  };

  const closeAddTaskModal = () => {
    document.querySelector("#add-task-modal [data-modal-close]")?.click();
  };

  const createTaskFromForm = (event) => {
    event.preventDefault();

    const formData = new FormData(addTaskForm);

    if (!validateTaskForm(formData)) return;

    const subtasks = String(formData.get("subtasks") || "")
      .split("\n")
      .map((subtask) => subtask.trim())
      .filter(Boolean)
      .map((text) => ({ id: createId("subtask"), text, done: false }));

    const nextTask = {
      id: createId("task"),
      title: formData.get("title").trim(),
      client: formData.get("client").trim(),
      description: formData.get("description").trim(),
      dueDate: formatDueDate(formData.get("dueDate")),
      dueAt: new Date(`${formData.get("dueDate")}T23:59:59`).toISOString(),
      priority: formData.get("priority"),
      assignee: formData.get("assignee") || "Unassigned",
      color: getPriorityColor(formData.get("priority")),
      subtasks,
      comments: [],
      status: "todo",
      archived: false,
      deleted: false,
      deletedAt: "",
    };

    tasks = [nextTask, ...tasks];
    saveTasks();
    addNotification(`New task assigned to ${nextTask.assignee}: ${nextTask.title}`, nextTask.id);
    render();
    addTaskForm.reset();
    closeAddTaskModal();
  };

  document.addEventListener("dragstart", (event) => {
    const card = event.target.closest(".task-card");

    if (!card) return;

    draggedTaskId = card.dataset.taskId;
    card.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
  });

  document.addEventListener("dragend", (event) => {
    event.target.closest(".task-card")?.classList.remove("is-dragging");
    draggedTaskId = null;
    document.querySelectorAll(".js-task-dropzone").forEach((dropzone) => {
      dropzone.classList.remove("is-drag-over");
    });
  });

  document.addEventListener("dragover", (event) => {
    const dropzone = event.target.closest(".js-task-dropzone");

    if (!dropzone) return;

    event.preventDefault();
    dropzone.classList.add("is-drag-over");
  });

  document.addEventListener("dragleave", (event) => {
    event.target.closest(".js-task-dropzone")?.classList.remove("is-drag-over");
  });

  document.addEventListener("drop", (event) => {
    const dropzone = event.target.closest(".js-task-dropzone");

    if (!dropzone || !draggedTaskId) return;

    event.preventDefault();
    dropzone.classList.remove("is-drag-over");
    updateTask(draggedTaskId, { status: dropzone.dataset.taskDropzone });
  });

  document.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-task-action]");

    if (!actionButton) return;

    const taskItem = actionButton.closest("[data-task-id]");
    const taskId = taskItem && taskItem.dataset.taskId;

    if (!taskId) return;

    if (actionButton.dataset.taskAction === "open") {
      openTaskDetails(taskId);
    }

    if (actionButton.dataset.taskAction === "archive") {
      updateTask(taskId, { archived: true });
    }

    if (actionButton.dataset.taskAction === "restore") {
      updateTask(taskId, { archived: false });
    }

    if (actionButton.dataset.taskAction === "restore-from-recycle") {
      updateTask(taskId, { deleted: false, deletedAt: "" });
    }

    if (actionButton.dataset.taskAction === "delete") {
      openDeleteTaskModal(taskId);
    }

    if (actionButton.dataset.taskAction === "delete-permanent") {
      deleteTaskPermanently(taskId);
    }
  });

  detailsForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const taskId = detailsForm.querySelector(".js-task-detail-id").value;
    const title = detailsForm.querySelector(".js-task-detail-title").value.trim();
    const description = detailsForm.querySelector(".js-task-detail-description").value.trim();
    const previousTask = getTaskById(taskId);
    const assignee = detailsForm.querySelector(".js-task-detail-assignee").value;

    setFieldError("task-detail-title", "");

    if (!title) {
      setFieldError("task-detail-title", "Please enter a task title.");
      return;
    }

    updateTask(taskId, { title, description, assignee });

    if (previousTask && previousTask.assignee !== assignee) {
      addNotification(`${title} was reassigned to ${assignee}.`, taskId);
    }

    document.querySelector("#task-details-modal [data-modal-close]")?.click();
  });

  addSubtaskForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const input = addSubtaskForm.querySelector(".js-new-subtask");
    const text = input.value.trim();
    const task = getTaskById(activeTaskId);

    if (!text || !task) return;

    updateTask(task.id, {
      subtasks: [...task.subtasks, { id: createId("subtask"), text, done: false }],
    });
    input.value = "";
  });

  document.addEventListener("change", (event) => {
    const checkbox = event.target.closest(".js-subtask-toggle");

    if (!checkbox || !activeTaskId) return;

    const subtaskItem = checkbox.closest("[data-subtask-id]");
    const task = getTaskById(activeTaskId);

    if (!subtaskItem || !task) return;

    updateTask(task.id, {
      subtasks: task.subtasks.map((subtask) =>
        subtask.id === subtaskItem.dataset.subtaskId ? { ...subtask, done: checkbox.checked } : subtask,
      ),
    });
  });

  document.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".js-remove-subtask");

    if (!removeButton || !activeTaskId) return;

    const subtaskItem = removeButton.closest("[data-subtask-id]");
    const task = getTaskById(activeTaskId);

    if (!subtaskItem || !task) return;

    updateTask(task.id, {
      subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskItem.dataset.subtaskId),
    });
  });


  document.addEventListener("click", (event) => {
    const editButton = event.target.closest(".js-edit-subtask");
    const saveButton = event.target.closest(".js-save-subtask");
    const cancelButton = event.target.closest(".js-cancel-subtask-edit");

    if (!activeTaskId || (!editButton && !saveButton && !cancelButton)) return;

    const subtaskItem = event.target.closest("[data-subtask-id]");
    const task = getTaskById(activeTaskId);

    if (!subtaskItem || !task) return;

    if (editButton) {
      editingSubtaskId = subtaskItem.dataset.subtaskId;
      renderTaskDetails(task);
      document.querySelector(".js-subtask-edit-input")?.focus({ preventScroll: true });
      return;
    }

    if (cancelButton) {
      editingSubtaskId = null;
      renderTaskDetails(task);
      return;
    }

    const input = subtaskItem.querySelector(".js-subtask-edit-input");
    const nextText = input?.value.trim();

    if (!nextText) return;

    editingSubtaskId = null;
    updateTask(task.id, {
      subtasks: task.subtasks.map((subtask) =>
        subtask.id === subtaskItem.dataset.subtaskId ? { ...subtask, text: nextText } : subtask,
      ),
    });
  });
  document.querySelector(".js-task-detail-assignee-control")?.addEventListener("change", (event) => {
    const hiddenAssignee = detailsForm?.querySelector(".js-task-detail-assignee");
    const assigneeAvatar = document.querySelector(".js-task-detail-assignee-avatar");
    const assigneeName = document.querySelector(".js-task-detail-assignee-name");

    if (hiddenAssignee) {
      hiddenAssignee.value = event.target.value;
    }

    if (assigneeAvatar) {
      assigneeAvatar.textContent = getInitials(event.target.value);
    }

    if (assigneeName) {
      assigneeName.textContent = event.target.value;
    }
  });

  commentsForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const task = getTaskById(activeTaskId);
    const messageInput = commentsForm.querySelector(".js-task-comment-message");
    const mentionInput = commentsForm.querySelector(".js-task-comment-mention");
    const error = commentsForm.querySelector(".js-task-comment-error");
    const message = messageInput.value.trim();
    const mention = mentionInput.value;

    if (error) {
      error.hidden = true;
      error.textContent = "";
    }

    if (!task || !message) {
      if (error) {
        error.textContent = "Please write a comment before submitting.";
        error.hidden = false;
      }
      return;
    }

    const nextComment = {
      id: createId("comment"),
      author: CURRENT_USER,
      mention,
      message,
      createdAt: new Date().toISOString(),
    };

    updateTask(task.id, { comments: [nextComment, ...task.comments] });
    addNotification(`${CURRENT_USER} commented on ${task.title}${mention ? ` and mentioned ${mention}` : ""}.`, task.id);
    commentsForm.reset();
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest(".js-notification-select")) return;

    const notificationItem = event.target.closest(".js-notification-item");

    if (!notificationItem) return;

    const notificationId = notificationItem.dataset.notificationId;
    const taskId = notificationItem.dataset.notificationTaskId;

    notifications = notifications.map((notification) =>
      notification.id === notificationId ? { ...notification, read: true, status: "read" } : notification,
    );
    saveNotifications();
    renderNotifications();

    if (taskId) {
      openTaskDetails(taskId);
    }
  });

  document.querySelector(".js-clear-notifications")?.addEventListener("click", () => {
    notifications = notifications.map((notification) => ({ ...notification, read: true, status: "read" }));
    saveNotifications();
    renderNotifications();
  });

  document.addEventListener("change", (event) => {
    const checkbox = event.target.closest(".js-notification-select");

    if (!checkbox) return;

    notifications = notifications.map((notification) =>
      notification.id === checkbox.dataset.notificationId ? { ...notification, selected: checkbox.checked } : notification,
    );
    saveNotifications();
  });

  document.querySelector(".js-delete-selected-notifications")?.addEventListener("click", () => {
    notifications = notifications.filter((notification) => !notification.selected);
    saveNotifications();
    renderNotifications();
  });

  document.querySelector(".js-delete-read-notifications")?.addEventListener("click", () => {
    notifications = notifications.filter((notification) => !(notification.read || notification.status === "read"));
    saveNotifications();
    renderNotifications();
  });


  document.querySelector(".js-move-task-recycle")?.addEventListener("click", () => {
    if (!pendingDeleteTaskId) return;

    moveTaskToRecycle(pendingDeleteTaskId);
    pendingDeleteTaskId = null;
    document.querySelector("#delete-task-modal [data-modal-close]")?.click();
  });

  document.querySelector(".js-delete-task-permanently")?.addEventListener("click", () => {
    if (!pendingDeleteTaskId) return;

    deleteTaskPermanently(pendingDeleteTaskId);
    pendingDeleteTaskId = null;
    document.querySelector("#delete-task-modal [data-modal-close]")?.click();
  });
  addTaskForm?.addEventListener("submit", createTaskFromForm);
  addTaskForm?.addEventListener("input", clearTaskFormErrors);
  document.querySelector(".js-task-reset")?.addEventListener("click", resetTasks);
  window.addEventListener("crm:clocktick", (event) => moveOverdueTasks(event.detail?.now || new Date()));
  window.setInterval(() => moveOverdueTasks(new Date()), 30000);

  moveOverdueTasks(new Date());
  render();
  openPendingTaskFromClientNote();
}
