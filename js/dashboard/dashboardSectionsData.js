"use strict";

/* --- Dynamic Dashboard Section Data --- */
(function initDashboardSectionsData() {
  const dashboardPage = document.querySelector(".dashboardPage");
  const storage = window.crmStorage;
  const constants = window.crmConstants;

  if (!dashboardPage || !storage || !constants) return;

  const TASKS_KEY = "crm_tasks";
  const SALES_SETTINGS_KEY = "crm_sales_settings";
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

  const normalizeStatus = (status) => {
    const normalized = String(status || "lead").toLowerCase();
    return STATUS_LABELS[normalized] ? normalized : "lead";
  };

  const parseValue = (value) => {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    return Number(String(value || "").replace(/[^\d.-]/g, "")) || 0;
  };

  const getClients = () =>
    readArray(constants.CLIENTS_KEY).map((client) => ({
      ...client,
      status: normalizeStatus(client.status),
      dealValue: parseValue(client.dealValue),
      notes: Array.isArray(client.notes) ? client.notes : [],
    }));

  const getTasks = () => readArray(TASKS_KEY);
  const getActivityLog = () => readArray(constants.ACTIVITY_KEY);
  const getSalesSettings = () => {
    const settings = storage.read(SALES_SETTINGS_KEY, {});
    const target = Number(settings?.monthlyTarget);
    return {
      monthlyTarget: Number.isFinite(target) && target >= 0 ? target : MONTHLY_TARGET,
    };
  };

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
    const salesSettings = getSalesSettings();
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
      monthlyTarget: salesSettings.monthlyTarget,
      targetProgress: salesSettings.monthlyTarget ? Math.min(Math.round((wonRevenue / salesSettings.monthlyTarget) * 100), 100) : 0,
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
      phone: "phone-light-mode.svg",
      recycle: "recycle-light-mode.svg",
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
      ["Client Status Summary", `${metrics.total} clients: ${metrics.counts.lead} lead, ${metrics.counts.contacted} contacted, ${metrics.counts.won} won, ${metrics.counts.lost} lost.`],
      ["Sales Target Overview", `${moneyFormatter.format(metrics.wonRevenue)} won revenue, ${metrics.targetProgress}% of monthly target.`],
    ];

    list.innerHTML = reports
      .map(
        ([title, text]) => `
          <div class="dashboard-list__item">
            ${getIcon("txt-doc")}
            <strong>${escapeHtml(title)}</strong>
            <span>${escapeHtml(text)}</span>
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
        badge: "client",
      },
      reminder: {
        source: "Reminders",
        badge: "reminder",
      },
      note: {
        source: "Notes",
        badge: "note",
      },
      task: {
        source: "Tasks",
        badge: "task",
      },
      notification: {
        source: "Notifications",
        badge: "notification",
      },
      phone: {
        source: "Phone",
        badge: "note",
      },
      communication: {
        source: "Communication",
        badge: "notification",
      },
      general: {
        source: "CRM",
        badge: "client",
      },
    };

    return configs[type] || configs.general;
  };

  const createActivity = ({ id, type, icon, title, summary, status, date }) => {
    const config = getActivityConfig(type);

    return {
      id: id || `activity-${type}-${date?.getTime?.() || Date.now()}-${Math.floor(Math.random() * 10000)}`,
      type,
      icon,
      title,
      summary,
      status,
      date,
      source: config.source,
      badge: config.badge,
    };
  };

  const createActivityItems = () => {
    return getActivityLog()
      .map((entry) =>
        createActivity({
          id: entry.id,
          type: entry.type || "general",
          icon: entry.icon || "clock",
          title: entry.title || "CRM activity",
          summary: entry.summary || "Account activity was recorded.",
          status: entry.status || "Updated",
          date: new Date(entry.createdAt || entry.date || Date.now()),
        }),
      )
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
          <article class="activity-card activity-card--${escapeHtml(activity.badge)}" data-activity-id="${escapeHtml(activity.id)}">
            <div class="activity-card__summary">
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
              </span>
            </div>
          </article>
        `,
      )
      .join("");
    updateThemeAssets(list);
  };

  const renderFavourites = () => {
    const list = document.querySelector(".js-favourites-list");
    const count = document.querySelector('[data-dashboard-section-metric="favouriteCount"]');
    const text = document.querySelector('[data-dashboard-section-text="favouriteCount"]');
    if (!list) return;

    if (count) count.textContent = "Future";
    if (text) {
      text.textContent = "Favourites is prepared for future saved clients and pinned workspace items.";
    }

    list.innerHTML = '<p class="task-empty">Favourites is prepared for future saved clients and pinned workspace items.</p>';
  };

  const renderAll = () => {
    renderSavedReports();
    renderActivity();
    renderFavourites();
  };

  window.addEventListener("storage", renderAll);
  window.addEventListener("crm:dashboarddata:update", renderAll);
  window.addEventListener("crm:tasks:update", renderAll);
  window.addEventListener("crm:activity:update", renderActivity);

  renderAll();
})();
