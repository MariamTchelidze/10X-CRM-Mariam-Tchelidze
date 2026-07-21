"use strict";

/* --- Task Board Controller --- */
const taskWorkspacePage = document.querySelector(".dashboardPage");
const taskSummaryPage = document.querySelector(".profilePage");

initTasks();

function initTasks() {
  const board = document.querySelector(".js-task-board");
  const summary = document.querySelector(".js-task-summary");

  if (!board && !summary) return;

  /* --- Task constants define storage, statuses, labels, and priorities. --- */
  const TASKS_KEY = "crm_tasks";
  const PENDING_TASK_KEY = "crm_pending_open_task";
  const TASK_ARCHIVE_DISABLED_MESSAGE = "Archive is disabled in exam-safe mode.";
  const TASK_DELETE_DISABLED_MESSAGE = "Delete is disabled in exam-safe mode.";
  const TASK_CHECKLIST_DISABLED_MESSAGE = "Checklist is disabled in exam-safe mode.";
  const TASK_COMMENTS_DISABLED_MESSAGE = "Task comments are prepared for future team collaboration.";
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
  const showExamSafeTaskToast = (message) => window.crmToast?.show(message, "info");

  /* --- Runtime state tracks the open task and current drag item. --- */
  let activeTaskId = null;
  let draggedTaskId = null;

  /* --- DOM references collect task modals, forms, and board controls. --- */
  const addTaskForm = document.querySelector(".js-add-task-form");
  const addTaskStatus = document.querySelector(".js-add-task-status");
  const detailsModal = document.getElementById("task-details-modal");
  const detailsForm = document.querySelector(".js-task-details-form");
  const commentsForm = document.querySelector(".js-task-comment-form");
  const addSubtaskForm = document.querySelector(".js-add-subtask-form");

  /* --- Storage helpers keep task and notification JSON safe. --- */
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

  /* --- Normalizer keeps only the active exam-safe task shape. --- */
  const normalizeTask = (task) => {
    return {
      ...task,
      id: task.id || task._id || createId("task"),
      color: getPriorityColor(task.priority),
      subtasks: [],
      comments: [],
      archived: Boolean(task.archived),
      deleted: Boolean(task.deleted),
      deletedAt: task.deletedAt || "",
      dueAt: task.dueAt || "",
    };
  };

  /* --- Saved state starts from localStorage and remains empty until users create tasks. --- */
  let tasks = readJson(TASKS_KEY, []).map(normalizeTask);

  const saveTasks = () => saveJson(TASKS_KEY, tasks);

  const getActiveTasks = () => tasks.filter((task) => !task.archived && !task.deleted);
  const getTaskById = (taskId) => tasks.find((task) => task.id === taskId);
  const getCurrentUserName = () => window.crmTeam?.getCurrentUserName?.() || "Account Owner";

  const getTeamOptions = () => {
    const members = window.crmTeam?.getAssignableMembers?.() || [];
    const savedAssignees = tasks
      .map((task) => task.assignee)
      .filter((assignee) => assignee && assignee !== "Unassigned")
      .map((assignee) => ({ value: assignee, label: assignee }));
    const allOptions = [...members, ...savedAssignees];

    return allOptions.filter((option, index, list) => {
      const value = String(option.value || option.label || "").toLowerCase();
      return value && list.findIndex((item) => String(item.value || item.label || "").toLowerCase() === value) === index;
    });
  };

  const fillSelect = (select, options, placeholder) => {
    if (!select) return;

    const selectedValue = select.value;
    select.innerHTML = `<option value="">${placeholder}</option>${options
      .map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`)
      .join("")}`;

    if ([...select.options].some((option) => option.value === selectedValue)) {
      select.value = selectedValue;
    }
  };

  const populateTeamSelects = () => {
    const options = getTeamOptions();

    document.querySelectorAll(".js-task-assignee, .js-task-detail-assignee, .js-task-detail-assignee-control").forEach((select) => {
      fillSelect(select, options, "Unassigned");
    });

    document.querySelectorAll(".js-task-comment-mention").forEach((select) => {
      fillSelect(
        select,
        options.map((option) => ({ value: option.value, label: `@${option.label}` })),
        "No mention",
      );
    });
  };

  /* --- Display helpers protect generated task markup and format dates. --- */
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

  /* --- Notification helper records task events for the notification modal. --- */
  const addNotification = (message, taskId = "") => {
    window.crmNotifications?.add(message, taskId);
  };

  const logTaskActivity = (entry) => {
    window.crmActivity?.add({
      type: "task",
      icon: entry.icon || "calendar",
      actionHref: "./dashboard.html#tasks",
      actionLabel: "Open Task Board",
      ...entry,
    });
  };

  /* --- Summary helpers calculate task totals for board columns. --- */
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

  /* --- Card renderer builds draggable task cards for each board column. --- */
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

  /* --- Render helpers repaint profile summaries, archive, board, and recycle bin. --- */
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

    if (archiveCount) {
      archiveCount.textContent = "Future feature";
    }

    if (!archiveList) return;

    archiveList.innerHTML = '<p class="task-empty">Task archive is prepared for future recovery workflow.</p>';
  };

  /* --- Board and Recycle Bin Rendering --- */
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

    if (recycleCount) {
      recycleCount.textContent = "Future feature";
    }

    if (!recycleList) return;

    recycleList.innerHTML = `
      <p class="task-empty">
        Recycle Bin is prepared for future task recovery. In exam-safe mode, tasks are not moved here.
      </p>
    `;
  };

  const renderChecklist = (task) => {
    const checklist = document.querySelector(".js-task-checklist");
    const progress = document.querySelector(".js-task-checklist-progress");
    const addChecklistInput = addSubtaskForm?.querySelector(".js-new-subtask");

    if (progress) {
      progress.textContent = "Prepared UI";
    }

    if (addChecklistInput) {
      addChecklistInput.value = "";
      addChecklistInput.placeholder = "Checklist is prepared for future task workflow.";
    }

    if (checklist) {
      checklist.innerHTML = '<p class="task-empty">Checklist is prepared for future task workflow.</p>';
    }
  };

  const renderComments = (task) => {
    const commentsList = document.querySelector(".js-task-comments");
    const commentsCount = document.querySelector(".js-task-comment-count");

    if (commentsCount) {
      commentsCount.textContent = "Prepared UI";
    }

    if (commentsList) {
      commentsList.innerHTML = '<p class="task-empty">Task comments are prepared for future team collaboration.</p>';
    }
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
      populateTeamSelects();
      assigneeControl.value = task.assignee || "";
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
    populateTeamSelects();

    if (taskWorkspacePage && board) {
      renderBoard();
      renderRecycleBin();
    }

    if (taskSummaryPage || summary) {
      renderSummary();
    }

    if (activeTaskId) {
      renderTaskDetails(getTaskById(activeTaskId));
    }

    window.dispatchEvent(new CustomEvent("crm:tasks:update", { detail: { tasks } }));
  };

  /* --- Task mutation helpers update one task and persist the board. --- */
  const updateTask = (taskId, updates) => {
    let updatedTask = null;

    tasks = tasks.map((task) => {
      if (task.id !== taskId) return task;

      updatedTask = normalizeTask({ ...task, ...updates });
      return updatedTask;
    });
    saveTasks();
    render();
  };


  /* --- Overdue helpers compare task deadlines with the live clock time. --- */
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

  /* --- Add-task validation helpers keep modal errors beside their fields. --- */
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

    const checklistText = String(formData.get("subtasks") || "").trim();
    const subtasks = [];

    if (checklistText) {
      showExamSafeTaskToast(TASK_CHECKLIST_DISABLED_MESSAGE);
    }

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

    let savedTask = normalizeTask(nextTask);

    tasks = [savedTask, ...tasks];
    saveTasks();
    addNotification(`New task assigned to ${savedTask.assignee}: ${savedTask.title}`, savedTask.id);
    logTaskActivity({
      title: `${savedTask.title} created`,
      summary: `${savedTask.client} - assigned to ${savedTask.assignee}`,
      status: "Created",
      relatedLabel: savedTask.client,
      description: savedTask.description || "A new task was created from the task board.",
      details: [
        ["Priority", savedTask.priority],
        ["Assignee", savedTask.assignee],
        ["Due date", savedTask.dueDate],
      ],
    });
    render();
    addTaskForm.reset();
    closeAddTaskModal();
  };

  const loadTasks = () => {
    moveOverdueTasks(new Date());
    render();
    openPendingTaskFromClientNote();
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
    const task = getTaskById(draggedTaskId);
    updateTask(draggedTaskId, { status: dropzone.dataset.taskDropzone });
    logTaskActivity({
      icon: dropzone.dataset.taskDropzone === "done" ? "check-symbol" : "calendar",
      title: `${task?.title || "Task"} moved to ${statusLabels[dropzone.dataset.taskDropzone]}`,
      summary: task?.client ? `Client: ${task.client}` : "Task status changed.",
      status: statusLabels[dropzone.dataset.taskDropzone] || "Updated",
      relatedLabel: task?.client || "Task",
      description: "A task card was moved between board columns.",
    });
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
      showExamSafeTaskToast(TASK_ARCHIVE_DISABLED_MESSAGE);
    }

    if (actionButton.dataset.taskAction === "delete") {
      showExamSafeTaskToast(TASK_DELETE_DISABLED_MESSAGE);
    }

    if (actionButton.dataset.taskAction === "delete-permanent") {
      showExamSafeTaskToast(TASK_DELETE_DISABLED_MESSAGE);
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
    input.value = "";
    showExamSafeTaskToast(TASK_CHECKLIST_DISABLED_MESSAGE);
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

    const error = commentsForm.querySelector(".js-task-comment-error");

    if (error) {
      error.hidden = true;
      error.textContent = "";
    }

    commentsForm.reset();
    showExamSafeTaskToast(TASK_COMMENTS_DISABLED_MESSAGE);
  });

  document.addEventListener("crm:open-task", (event) => {
    const taskId = event.detail?.taskId;
    if (taskId) openTaskDetails(taskId);
  });

  addTaskForm?.addEventListener("submit", createTaskFromForm);
  addTaskForm?.addEventListener("input", clearTaskFormErrors);
  window.addEventListener("crm:clocktick", (event) => moveOverdueTasks(event.detail?.now || new Date()));
  window.setInterval(() => moveOverdueTasks(new Date()), 30000);

  loadTasks();
}
