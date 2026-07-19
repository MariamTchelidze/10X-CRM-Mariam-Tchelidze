"use strict";

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

  const createActivityItems = () => {
    const metrics = getMetrics();
    const notifications = getNotifications();
    const activities = [];

    metrics.clients.forEach((client) => {
      activities.push({
        type: "client",
        icon: "users",
        title: `${client.name || "Client"} is ${STATUS_LABELS[client.status]}.`,
        text: `${client.company || "No company"} - ${moneyFormatter.format(client.dealValue)}`,
        date: getClientDate(client),
      });

      if (client.reminderAt) {
        activities.push({
          type: "reminder",
          icon: "calendar",
          title: `Reminder set for ${client.name || "client"}.`,
          text: client.reminderNotified ? "Reminder already sent." : "Reminder waiting for due time.",
          date: new Date(client.reminderAt),
        });
      }

      client.notes.forEach((note) => {
        activities.push({
          type: "note",
          icon: "chat",
          title: `${note.author || "User"} added a note for ${client.name || "client"}.`,
          text: note.status ? `Status: ${note.status}` : String(note.text || "").slice(0, 90),
          date: new Date(note.date || note.createdAt || client.createdAt),
        });
      });
    });

    metrics.tasks.forEach((task) => {
      if (task.deleted) return;
      activities.push({
        type: "task",
        icon: task.status === "done" ? "check-symbol" : "calendar",
        title: `${task.title || "Task"} - ${task.status || "todo"}.`,
        text: task.client ? `Client: ${task.client}` : task.description || "Task activity",
        date: new Date(task.updatedAt || task.createdAt || task.dueAt || Date.now()),
      });
    });

    notifications.forEach((notification) => {
      activities.push({
        type: "notification",
        icon: "notification",
        title: notification.message || "Notification",
        text: notification.status === "read" || notification.read ? "Read notification" : "Unread notification",
        date: new Date(notification.createdAt || Date.now()),
      });
    });

    return activities
      .filter((item) => !Number.isNaN(item.date.getTime()))
      .sort((a, b) => b.date - a.date)
      .slice(0, 8);
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
          <div class="activity-timeline__item" data-activity-type="${escapeHtml(activity.type)}">
            ${getIcon(activity.icon)}
            <div>
              <strong>${escapeHtml(activity.title)}</strong>
              <span>${escapeHtml(activity.text)} - ${formatDateTime(activity.date)}</span>
            </div>
          </div>
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
    const button = event.target.closest(".js-toggle-favourite");
    if (!button) return;
    setFavourite(button.dataset.clientId, button.dataset.favouriteAction === "add");
  });

  window.addEventListener("storage", renderAll);
  window.addEventListener("crm:dashboarddata:update", renderAll);
  window.addEventListener("crm:tasks:update", renderAll);

  renderAll();
})();
