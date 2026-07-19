"use strict";

/* --- Dynamic Dashboard Section Data --- */
(function initDashboardSectionsData() {
  const dashboardPage = document.querySelector(".dashboardPage");
  const storage = window.crmStorage;
  const constants = window.crmConstants;

  if (!dashboardPage || !storage || !constants) return;

  const TASKS_KEY = "crm_tasks";
  const NOTIFICATIONS_KEY = "crm_task_notifications";
  const FAVOURITES_KEY = "crm_favourites";
  const MONTHLY_TARGET = 32000;
  const STATUS_LABELS = {
    lead: "Lead",
    contacted: "Contacted",
    won: "Won",
    lost: "Lost",
  };

  const moneyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const escapeHtml = (value) =>
    String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  /* --- Storage and Formatting Helpers --- */
  const readArray = (key) => {
    const value = storage.read(key, []);
    return Array.isArray(value) ? value : [];
  };

  const writeArray = (key, value) => {
    storage.write(key, Array.isArray(value) ? value : []);
  };

  const normalizeStatus = (status) => {
    const normalized = String(status || "lead").toLowerCase();
    return STATUS_LABELS[normalized] ? normalized : "lead";
  };

  const parseValue = (value) => {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    return Number(String(value || "").replace(/[^\d.-]/g, "")) || 0;
  };

  const getClientDate = (client) => {
    const date = new Date(client.updatedAt || client.createdAt || client.date || client.id);
    return Number.isNaN(date.getTime()) ? new Date(0) : date;
  };

  const getClients = () =>
    readArray(constants.CLIENTS_KEY).map((client) => ({
      ...client,
      status: normalizeStatus(client.status),
      dealValue: parseValue(client.dealValue),
      notes: Array.isArray(client.notes) ? client.notes : [],
    }));

  const getTasks = () => readArray(TASKS_KEY);
  const getNotifications = () => readArray(NOTIFICATIONS_KEY);
  const getFavourites = () => readArray(FAVOURITES_KEY);

  const formatDateTime = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Recently";
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* --- Section metrics summarize current client, task, note, and file data. --- */
  const getMetrics = () => {
    const clients = getClients();
    const tasks = getTasks();
    const counts = { lead: 0, contacted: 0, won: 0, lost: 0 };

    clients.forEach((client) => {
      counts[client.status] += 1;
    });

    const total = clients.length;
    const activeDeals = counts.lead + counts.contacted;
    const wonRevenue = clients.filter((client) => client.status === "won").reduce((sum, client) => sum + client.dealValue, 0);
    const openTasks = tasks.filter((task) => !task.archived && !task.deleted && task.status !== "done");
    const dueTasks = openTasks.filter((task) => task.status === "overdue" || task.dueAt || task.dueDate);

    return {
      clients,
      tasks,
      counts,
      total,
      activeDeals,
      wonRevenue,
      openTasks,
      dueTasks,
      pipelineHealth: total ? Math.round(((counts.lead + counts.contacted + counts.won) / total) * 100) : 0,
      conversion: total ? Math.round((counts.won / total) * 100) : 0,
      targetProgress: Math.min(Math.round((wonRevenue / MONTHLY_TARGET) * 100), 100),
    };
  };

  const getIcon = (name) => {
    const lightMap = {
      "txt-doc": "txt-doc-light-theme.svg",
      star: "star-light-theme.svg",
      chat: "chat-light-theme.svg",
      calendar: "calendar-light-theme.svg",
      "check-symbol": "check-symbol-light-theme.svg",
      users: "users-light-mode.svg",
      notification: "notification-light-theme.svg",
    };
    return `
      <img
        src="./assets/icons/${name}.svg"
        data-theme-src-dark="./assets/icons/${name}.svg"
        data-theme-src-light="./assets/icons/${lightMap[name] || `${name}-light-theme.svg`}"
        alt=""
        class="dashboard-list__icon activity-timeline__icon"
      />
    `;
  };

  const updateThemeAssets = (container) => {
    const theme = window.crmTheme?.getTheme?.() || document.body.dataset.theme || "dark";
    container.querySelectorAll("[data-theme-src-dark][data-theme-src-light]").forEach((element) => {
      const source = theme === "light" ? element.dataset.themeSrcLight : element.dataset.themeSrcDark;
      if (source) element.setAttribute("src", source);
    });
  };

  const renderSavedReports = () => {
    const list = document.querySelector(".js-saved-reports-list");
    if (!list) return;

    const metrics = getMetrics();
    const reports = [
      {
        title: "Client Status Summary",
        text: `${metrics.counts.lead} lead, ${metrics.counts.contacted} contacted, ${metrics.counts.won} won, ${metrics.counts.lost} lost.`,
      },
      {
        title: "Sales Target Overview",
        text: `${moneyFormatter.format(metrics.wonRevenue)} won revenue, ${metrics.targetProgress}% of ${moneyFormatter.format(MONTHLY_TARGET)} target.`,
      },
      {
        title: "Task Workload Summary",
        text: `${metrics.openTasks.length} open task${metrics.openTasks.length === 1 ? "" : "s"} and ${metrics.dueTasks.length} task${metrics.dueTasks.length === 1 ? "" : "s"} needing attention.`,
      },
    ];

    list.innerHTML = reports
      .map(
        (report) => `
          <div class="dashboard-list__item">
            ${getIcon("txt-doc")}
            <strong>${escapeHtml(report.title)}</strong>
            <span>${escapeHtml(report.text)}</span>
          </div>
        `,
      )
      .join("");
    updateThemeAssets(list);
  };

  const getActivityConfig = (type) => {
    const configs = {
      client: {
        source: "Clients",
        section: "Clients page > Client card",
        badge: "client",
        actionLabel: "Open Clients",
        actionHref: "./clients.html",
      },
      reminder: {
        source: "Reminders",
        section: "Clients page > Client details",
        badge: "reminder",
        actionLabel: "Open Clients",
        actionHref: "./clients.html",
      },
      note: {
        source: "Notes",
        section: "Clients page > Client details modal",
        badge: "note",
        actionLabel: "Open Clients",
        actionHref: "./clients.html",
      },
      task: {
        source: "Tasks",
        section: "Dashboard > Task Board",
        badge: "task",
        actionLabel: "Open Task Board",
        actionHref: "./dashboard.html#tasks",
      },
      notification: {
        source: "Notifications",
        section: "Header > Notifications modal",
        badge: "notification",
        actionLabel: "Open Notifications",
        actionHref: "./dashboard.html#activity",
      },
    };

    return configs[type] || configs.client;
  };

  const createActivity = ({ type, icon, title, summary, status, relatedLabel, date, description, details = [], actionHref, actionLabel }) => {
    const config = getActivityConfig(type);

    return {
      id: `activity-${type}-${date?.getTime?.() || Date.now()}-${Math.floor(Math.random() * 10000)}`,
      type,
      icon,
      title,
      summary,
      status,
      relatedLabel,
      date,
      source: config.source,
      section: config.section,
      badge: config.badge,
      description,
      details,
      actionHref: actionHref || config.actionHref,
      actionLabel: actionLabel || config.actionLabel,
    };
  };

  const createActivityItems = () => {
    const metrics = getMetrics();
    const notifications = getNotifications();
    const activities = [];

    metrics.clients.forEach((client) => {
      activities.push(
        createActivity({
          type: "client",
          icon: "users",
          title: `${client.name || "Client"} moved through the client pipeline`,
          summary: `${client.company || "No company"} - ${STATUS_LABELS[client.status]} - ${moneyFormatter.format(client.dealValue)}`,
          status: STATUS_LABELS[client.status],
          relatedLabel: client.name || "Client",
          date: getClientDate(client),
          description: "This activity is computed from the current client record stored in crm_clients.",
          details: [
            ["Company", client.company || "No company added"],
            ["Deal value", moneyFormatter.format(client.dealValue)],
            ["Current status", STATUS_LABELS[client.status]],
          ],
        }),
      );

      if (client.reminderAt) {
        const reminderDate = new Date(client.reminderAt);
        activities.push(
          createActivity({
            type: "reminder",
            icon: "calendar",
            title: `Reminder ${client.reminderNotified ? "completed" : "scheduled"} for ${client.name || "client"}`,
            summary: client.reminderNotified ? "Reminder already sent." : "Reminder waiting for due time.",
            status: client.reminderNotified ? "Sent" : "Scheduled",
            relatedLabel: client.name || "Client",
            date: reminderDate,
            description: "This reminder comes from the client detail modal reminder block.",
            details: [
              ["Reminder time", formatDateTime(reminderDate)],
              ["Notification state", client.reminderNotified ? "Already notified" : "Waiting"],
              ["Client", client.name || "Unknown client"],
            ],
          }),
        );
      }

      client.notes.forEach((note) => {
        const noteDate = new Date(note.date || note.createdAt || client.createdAt);
        activities.push(
          createActivity({
            type: "note",
            icon: "chat",
            title: `${note.author || "User"} added a client note`,
            summary: note.status ? `Status: ${note.status}` : String(note.text || "").slice(0, 90),
            status: note.status || "No status",
            relatedLabel: client.name || "Client",
            date: noteDate,
            description: String(note.text || "No note text added."),
            details: [
              ["Client", client.name || "Unknown client"],
              ["Author", note.author || "Unknown author"],
              ["Attached task", note.taskTitle || note.taskId || "No task attached"],
            ],
            actionHref: note.taskId ? "./dashboard.html#tasks" : "./clients.html",
            actionLabel: note.taskId ? "Open Task Board" : "Open Clients",
          }),
        );
      });
    });

    metrics.tasks.forEach((task) => {
      if (task.deleted) return;
      const taskDate = new Date(task.updatedAt || task.createdAt || task.dueAt || Date.now());
      activities.push(
        createActivity({
          type: "task",
          icon: task.status === "done" ? "check-symbol" : "calendar",
          title: task.title || "Task activity",
          summary: task.client ? `Client: ${task.client}` : task.description || "Task activity",
          status: task.status || "todo",
          relatedLabel: task.client || "No client",
          date: taskDate,
          description: task.description || "No task description added.",
          details: [
            ["Priority", task.priority || "No priority"],
            ["Assignee", task.assignee || "Unassigned"],
            ["Due date", task.dueAt || task.dueDate || "No due date"],
          ],
        }),
      );
    });

    notifications.forEach((notification) => {
      const notificationDate = new Date(notification.createdAt || Date.now());
      activities.push(
        createActivity({
          type: "notification",
          icon: "notification",
          title: notification.message || "Notification",
          summary: notification.status === "read" || notification.read ? "Read notification" : "Unread notification",
          status: notification.status || (notification.read ? "read" : "unread"),
          relatedLabel: notification.taskId ? "Linked task" : "General update",
          date: notificationDate,
          description: "This item comes from the notification storage used by task and reminder events.",
          details: [
            ["Notification ID", notification.id || "No ID"],
            ["Linked task", notification.taskId || "No linked task"],
            ["Selected", notification.selected ? "Yes" : "No"],
          ],
          actionHref: notification.taskId ? "./dashboard.html#tasks" : "./dashboard.html#activity",
          actionLabel: notification.taskId ? "Open Task Board" : "Stay In Activity",
        }),
      );
    });

    return activities
      .filter((item) => !Number.isNaN(item.date.getTime()))
      .sort((a, b) => b.date - a.date)
      .slice(0, 8);
  };

  const renderActivityDetails = (activity) => {
    const details = [
      ["Source", activity.source],
      ["Page / Section", activity.section],
      ["Related item", activity.relatedLabel],
      ["Status", activity.status],
      ...activity.details,
    ];

    return `
      <div class="activity-card__details" hidden>
        <p class="activity-card__description">${escapeHtml(activity.description)}</p>
        <dl class="activity-card__meta-list">
          ${details
            .map(
              ([label, value]) => `
                <div class="activity-card__meta-item">
                  <dt>${escapeHtml(label)}</dt>
                  <dd>${escapeHtml(value)}</dd>
                </div>
              `,
            )
            .join("")}
        </dl>
        <a class="btn btn--ghost btn--sm activity-card__link" href="${escapeHtml(activity.actionHref)}">${escapeHtml(activity.actionLabel)}</a>
      </div>
    `;
  };

  const renderActivity = () => {
    const list = document.querySelector(".js-activity-list");
    if (!list) return;

    const activities = createActivityItems();
    if (!activities.length) {
      list.innerHTML = '<p class="task-empty">No activity yet. Client updates, notes, reminders, tasks, and notifications will appear here.</p>';
      return;
    }

    list.innerHTML = activities
      .map(
        (activity) => `
          <article class="activity-card activity-card--${escapeHtml(activity.badge)}" data-activity-id="${escapeHtml(activity.id)}">
            <button class="activity-card__summary js-activity-toggle" type="button" aria-expanded="false">
              <span class="activity-card__icon">${getIcon(activity.icon)}</span>
              <span class="activity-card__content">
                <span class="activity-card__topline">
                  <span class="activity-card__badge">${escapeHtml(activity.source)}</span>
                  <strong>${escapeHtml(activity.title)}</strong>
                </span>
                <span class="activity-card__summary-text">${escapeHtml(activity.summary)}</span>
              </span>
              <span class="activity-card__side">
                <time>${formatDateTime(activity.date)}</time>
                <span class="activity-card__status">${escapeHtml(activity.status)}</span>
                <span class="activity-card__chevron" aria-hidden="true"></span>
              </span>
            </button>
            ${renderActivityDetails(activity)}
          </article>
        `,
      )
      .join("");
    updateThemeAssets(list);
  };

  const isFavourite = (clientId) => getFavourites().some((item) => item.type === "client" && String(item.id) === String(clientId));

  const setFavourite = (clientId, shouldPin) => {
    const favourites = getFavourites().filter((item) => !(item.type === "client" && String(item.id) === String(clientId)));
    if (shouldPin) favourites.unshift({ type: "client", id: clientId, createdAt: new Date().toISOString() });
    writeArray(FAVOURITES_KEY, favourites);
    renderFavourites();
    renderActivity();
  };

  const renderFavourites = () => {
    const list = document.querySelector(".js-favourites-list");
    const count = document.querySelector('[data-dashboard-section-metric="favouriteCount"]');
    const text = document.querySelector('[data-dashboard-section-text="favouriteCount"]');
    if (!list) return;

    const metrics = getMetrics();
    const favourites = getFavourites();
    const pinnedClients = favourites
      .filter((item) => item.type === "client")
      .map((item) => metrics.clients.find((client) => String(client.id) === String(item.id)))
      .filter(Boolean);
    const suggestions = metrics.clients
      .filter((client) => !isFavourite(client.id))
      .sort((a, b) => b.dealValue - a.dealValue)
      .slice(0, pinnedClients.length ? 3 : 5);

    if (count) count.textContent = pinnedClients.length;
    if (text) {
      text.textContent = pinnedClients.length
        ? `${pinnedClients.length} pinned client${pinnedClients.length === 1 ? "" : "s"} saved for quick access.`
        : "Pin high-value clients from the list below.";
    }

    if (!pinnedClients.length && !suggestions.length) {
      list.innerHTML = '<p class="task-empty">No clients available to pin yet.</p>';
      return;
    }

    const pinnedMarkup = pinnedClients
      .map(
        (client) => `
          <div class="dashboard-list__item dashboard-list__item--with-action">
            ${getIcon("star")}
            <strong>${escapeHtml(client.name)}</strong>
            <span>${escapeHtml(client.company || "No company")} - ${STATUS_LABELS[client.status]} - ${moneyFormatter.format(client.dealValue)}</span>
            <button class="btn btn--ghost btn--sm js-toggle-favourite" type="button" data-client-id="${escapeHtml(client.id)}" data-favourite-action="remove">Remove</button>
          </div>
        `,
      )
      .join("");

    const suggestionMarkup = suggestions
      .map(
        (client) => `
          <div class="dashboard-list__item dashboard-list__item--with-action dashboard-list__item--suggested">
            ${getIcon("star")}
            <strong>${escapeHtml(client.name)}</strong>
            <span>${escapeHtml(client.company || "No company")} - suggested from ${moneyFormatter.format(client.dealValue)} value</span>
            <button class="btn btn--secondary btn--sm js-toggle-favourite" type="button" data-client-id="${escapeHtml(client.id)}" data-favourite-action="add">Pin</button>
          </div>
        `,
      )
      .join("");

    list.innerHTML = `
      ${pinnedMarkup}
      ${suggestions.length ? '<p class="dashboard-list__section-label">Suggested clients</p>' : ""}
      ${suggestionMarkup}
    `;
    updateThemeAssets(list);
  };

  const renderAll = () => {
    renderSavedReports();
    renderActivity();
    renderFavourites();
  };

  document.addEventListener("click", (event) => {
    const activityToggle = event.target.closest(".js-activity-toggle");

    if (activityToggle) {
      const card = activityToggle.closest(".activity-card");
      const details = card?.querySelector(".activity-card__details");
      const isOpen = activityToggle.getAttribute("aria-expanded") === "true";

      activityToggle.setAttribute("aria-expanded", String(!isOpen));
      card?.classList.toggle("is-open", !isOpen);
      if (details) details.hidden = isOpen;
      return;
    }

    const button = event.target.closest(".js-toggle-favourite");
    if (!button) return;
    setFavourite(button.dataset.clientId, button.dataset.favouriteAction === "add");
  });

  window.addEventListener("storage", renderAll);
  window.addEventListener("crm:dashboarddata:update", renderAll);
  window.addEventListener("crm:tasks:update", renderAll);

  renderAll();
})();
