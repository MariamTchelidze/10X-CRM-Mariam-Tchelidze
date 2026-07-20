/* --- Dashboard Summary Controller --- */
const dashboardPage = document.querySelector(".dashboardPage");

const TASKS_KEY = "crm_tasks";
const SALES_SETTINGS_KEY = "crm_sales_settings";
const MONTHLY_TARGET = 32000;
const HOT_LEAD_THRESHOLD = 2500;
const STATUS_ORDER = ["lead", "contacted", "won", "lost"];
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

initDashboard();

function initDashboard() {
  if (!dashboardPage) return;

  renderDashboard();
  bindSalesControls();
  window.addEventListener("storage", renderDashboard);
  window.addEventListener("crm:tasks:update", renderDashboard);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getInitials(name) {
  return String(name || "Client")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.at(0)?.toUpperCase() || "")
    .join("");
}

function normalizeStatus(status) {
  const normalized = String(status || "lead").trim().toLowerCase();
  return STATUS_ORDER.includes(normalized) ? normalized : "lead";
}

function parseDealValue(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  return Number(String(value || "").replace(/[^\d.-]/g, "")) || 0;
}

function getClientDate(client) {
  const value = client.createdAt || client.updatedAt || client.date || client.id;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function getStoredClients() {
  /* --- Dashboard reads shared storage to summarize clients and tasks. --- */
  const storage = window.crmStorage;
  const constants = window.crmConstants;
  if (!storage || !constants) return [];

  const storedClients = storage.read(constants.CLIENTS_KEY, []);
  if (!Array.isArray(storedClients)) return [];

  return storedClients.map((client) => ({
    ...client,
    status: normalizeStatus(client.status),
    dealValue: parseDealValue(client.dealValue),
  }));
}

function getStoredTasks() {
  const storage = window.crmStorage;
  if (!storage) return [];

  const storedTasks = storage.read(TASKS_KEY, []);
  return Array.isArray(storedTasks) ? storedTasks : [];
}

function getSalesSettings() {
  const storage = window.crmStorage;
  const settings = storage?.read(SALES_SETTINGS_KEY, {});
  const target = Number(settings?.monthlyTarget);

  return {
    monthlyTarget: Number.isFinite(target) && target >= 0 ? target : MONTHLY_TARGET,
    statusFilter: settings?.statusFilter || "all",
    sortBy: settings?.sortBy || "value-desc",
  };
}

function saveSalesSettings(nextSettings) {
  const storage = window.crmStorage;
  if (!storage) return;

  storage.write(SALES_SETTINGS_KEY, {
    ...getSalesSettings(),
    ...nextSettings,
  });
}

function getLastSixMonths() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleString("en-US", { month: "short" }),
      value: 0,
    };
  });
}

function getDashboardMetrics() {
  const clients = getStoredClients();
  const tasks = getStoredTasks();
  const salesSettings = getSalesSettings();
  const statusCounts = STATUS_ORDER.reduce((counts, status) => ({ ...counts, [status]: 0 }), {});
  const stageRevenue = STATUS_ORDER.reduce((totals, status) => ({ ...totals, [status]: 0 }), {});

  clients.forEach((client) => {
    statusCounts[client.status] += 1;
    stageRevenue[client.status] += client.dealValue;
  });

  const totalClients = clients.length;
  const activeDeals = statusCounts.lead + statusCounts.contacted;
  const wonClients = clients.filter((client) => client.status === "won");
  const wonRevenue = wonClients.reduce((sum, client) => sum + client.dealValue, 0);
  const activeTasks = tasks.filter((task) => !task.archived && !task.deleted);
  const pendingTasks = activeTasks.filter((task) => task.status !== "done").length;
  const todayKey = new Date().toISOString().slice(0, 10);
  const dueToday = activeTasks.filter((task) => String(task.dueDate || "").slice(0, 10) === todayKey).length;
  const hotLeads = clients.filter((client) => client.status === "lead" && client.dealValue >= HOT_LEAD_THRESHOLD).length;
  const pipelineHealth = totalClients ? Math.round(((statusCounts.lead + statusCounts.contacted + statusCounts.won) / totalClients) * 100) : 0;
  const conversionRate = totalClients ? Math.round((statusCounts.won / totalClients) * 100) : 0;
  const monthlyTargetProgress = salesSettings.monthlyTarget ? Math.min(Math.round((wonRevenue / salesSettings.monthlyTarget) * 100), 100) : 0;
  const recentClients = [...clients].sort((a, b) => getClientDate(b) - getClientDate(a)).slice(0, 5);
  const salesFocus = [...clients]
    .filter((client) => client.status !== "lost")
    .sort((a, b) => b.dealValue - a.dealValue)
    .slice(0, 3);
  const salesDeals = getFilteredSalesDeals(clients, salesSettings);
  const monthlyWon = getLastSixMonths();

  wonClients.forEach((client) => {
    const date = getClientDate(client);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const month = monthlyWon.find((item) => item.key === key);
    if (month) month.value += client.dealValue;
  });

  return {
    totalClients,
    activeDeals,
    wonRevenue,
    wonCount: wonClients.length,
    pendingTasks,
    dueToday,
    hotLeads,
    followUps: dueToday || pendingTasks,
    pipelineHealth,
    conversionRate,
    monthlyTarget: salesSettings.monthlyTarget,
    monthlyTargetProgress,
    statusCounts,
    stageRevenue,
    recentClients,
    salesFocus,
    salesDeals,
    tasks,
    salesSettings,
    chartData: {
      stageMix: STATUS_ORDER.map((status) => statusCounts[status]),
      stageLabels: STATUS_ORDER.map((status) => STATUS_LABELS[status]),
      monthlyWonValues: monthlyWon.map((month) => month.value),
      monthlyWonLabels: monthlyWon.map((month) => month.label),
      outcomeValues: [statusCounts.won, statusCounts.lost, activeDeals],
      outcomeLabels: ["Won", "Lost", "Active"],
    },
  };
}

function getFilteredSalesDeals(clients, settings) {
  const statusFilter = STATUS_ORDER.includes(settings.statusFilter) ? settings.statusFilter : "all";
  const filteredClients = statusFilter === "all" ? [...clients] : clients.filter((client) => client.status === statusFilter);

  return filteredClients.sort((a, b) => {
    if (settings.sortBy === "value-asc") return a.dealValue - b.dealValue;
    if (settings.sortBy === "newest") return getClientDate(b) - getClientDate(a);
    if (settings.sortBy === "oldest") return getClientDate(a) - getClientDate(b);
    if (settings.sortBy === "name") return String(a.name || "").localeCompare(String(b.name || ""));
    return b.dealValue - a.dealValue;
  });
}

function setText(selector, text) {
  const element = document.querySelector(selector);
  if (element) element.textContent = text;
}

function renderMetricCards(metrics) {
  setText('[data-dashboard-metric="totalClients"]', metrics.totalClients);
  setText('[data-dashboard-trend="totalClients"]', `${metrics.recentClients.length} most recent shown below`);
  setText('[data-dashboard-metric="activeDeals"]', metrics.activeDeals);
  setText('[data-dashboard-trend="activeDeals"]', `${metrics.hotLeads} hot leads above $2,500`);
  setText('[data-dashboard-metric="wonRevenue"]', moneyFormatter.format(metrics.wonRevenue));
  setText('[data-dashboard-trend="wonRevenue"]', `${metrics.wonCount} closed deal${metrics.wonCount === 1 ? "" : "s"}`);
  setText('[data-dashboard-metric="pendingTasks"]', metrics.pendingTasks);
  setText('[data-dashboard-trend="pendingTasks"]', `${metrics.dueToday} due today`);
  setText('[data-dashboard-metric="monthlyTarget"]', moneyFormatter.format(metrics.monthlyTarget));
  setText('[data-dashboard-trend="monthlyTarget"]', `${metrics.monthlyTargetProgress}% of target is covered by won revenue.`);
  setText('[data-dashboard-metric="hotLeads"]', metrics.hotLeads);
  setText('[data-dashboard-trend="hotLeads"]', `Lead clients with deal value of ${moneyFormatter.format(HOT_LEAD_THRESHOLD)} or higher.`);
  setText('[data-dashboard-metric="followUps"]', metrics.followUps);
  setText('[data-dashboard-trend="followUps"]', `${metrics.pendingTasks} active task${metrics.pendingTasks === 1 ? "" : "s"} still need attention.`);
  setText('[data-dashboard-metric="pipelineHealth"]', `${metrics.pipelineHealth}%`);
  setText('[data-dashboard-trend="pipelineHealth"]', "Share of clients still active or already won.");
  setText('[data-dashboard-metric="conversionRate"]', `${metrics.conversionRate}%`);
  setText('[data-dashboard-trend="conversionRate"]', "Won clients divided by total stored clients.");
}

function renderPipeline(metrics) {
  const maxCount = Math.max(...STATUS_ORDER.map((status) => metrics.statusCounts[status]), 1);

  STATUS_ORDER.forEach((status) => {
    const count = metrics.statusCounts[status];
    const countElement = document.getElementById(`pipeline-${status}`);
    const fillElement = document.getElementById(`pipeline-${status}-fill`);

    if (countElement) countElement.textContent = count;
    if (fillElement) fillElement.style.width = `${Math.max((count / maxCount) * 100, count ? 8 : 0)}%`;
  });
}

function renderRecentClients(metrics) {
  const list = document.getElementById("recent-clients-list");
  if (!list) return;

  if (!metrics.recentClients.length) {
    list.innerHTML = '<p class="task-empty">No clients yet. Add your first client to see activity here.</p>';
    return;
  }

  list.innerHTML = metrics.recentClients
    .map(
      (client) => `
        <article class="recent-client" data-client-id="${escapeHtml(client.id)}">
          <div class="recent-client__avatar" aria-hidden="true">${escapeHtml(getInitials(client.name))}</div>
          <div class="recent-client__info">
            <h3 class="recent-client__name">${escapeHtml(client.name)}</h3>
            <p class="recent-client__company">${escapeHtml(client.company || "No company added")}</p>
          </div>
          <span class="status-badge status-badge--${client.status}">${STATUS_LABELS[client.status]}</span>
        </article>
      `,
    )
    .join("");
}

function getClientOpenTasks(client, tasks) {
  const clientName = String(client.name || "").toLowerCase();
  const clientCompany = String(client.company || "").toLowerCase();

  return tasks.filter((task) => {
    if (task.archived || task.deleted || task.status === "done") return false;
    const taskClient = String(task.client || "").toLowerCase();
    return taskClient && (taskClient === clientName || taskClient === clientCompany);
  });
}

function getSalesNextStep(client, tasks) {
  const openTasks = getClientOpenTasks(client, tasks);

  if (!openTasks.length) return "No open follow-up";
  const sortedTasks = [...openTasks].sort((a, b) => new Date(a.dueDate || a.dueAt || 0) - new Date(b.dueDate || b.dueAt || 0));
  const task = sortedTasks[0];
  const dueDate = task.dueDate ? ` - due ${new Date(task.dueDate).toLocaleDateString("en-GB")}` : "";
  return `${task.title || "Follow up"}${dueDate}`;
}

function renderSalesControls(metrics) {
  const targetInput = document.querySelector(".js-sales-target-input");
  const statusFilter = document.querySelector(".js-sales-status-filter");
  const sortSelect = document.querySelector(".js-sales-sort-select");

  if (targetInput && document.activeElement !== targetInput) targetInput.value = String(metrics.monthlyTarget);
  if (statusFilter) statusFilter.value = metrics.salesSettings.statusFilter;
  if (sortSelect) sortSelect.value = metrics.salesSettings.sortBy;
}

function renderSalesStages(metrics) {
  const container = document.querySelector(".js-sales-stage-summary");
  if (!container) return;

  container.innerHTML = STATUS_ORDER.map(
    (status) => `
      <article class="sales-stage-card sales-stage-card--${status}">
        <span class="sales-stage-card__label">${STATUS_LABELS[status]}</span>
        <strong class="sales-stage-card__value">${metrics.statusCounts[status]}</strong>
        <span class="sales-stage-card__meta">${moneyFormatter.format(metrics.stageRevenue[status])}</span>
      </article>
    `,
  ).join("");
}

function renderSalesFocus(metrics) {
  const list = document.getElementById("sales-focus-list");
  const count = document.querySelector(".js-sales-focus-count");
  if (!list) return;

  if (count) count.textContent = `${metrics.salesFocus.length} active`;

  if (!metrics.salesFocus.length) {
    list.innerHTML = '<p class="task-empty">No active sales focus yet.</p>';
    return;
  }

  list.innerHTML = metrics.salesFocus
    .map(
      (client) => `
        <div class="dashboard-list__item sales-focus-item">
          <span class="status-badge status-badge--${client.status}">${STATUS_LABELS[client.status]}</span>
          <div>
            <strong>${escapeHtml(client.name)}</strong>
            <span>${escapeHtml(client.company || "Company not added")}</span>
          </div>
          <span>${moneyFormatter.format(client.dealValue)} - ${escapeHtml(getSalesNextStep(client, metrics.tasks))}</span>
        </div>
      `,
    )
    .join("");
}

function renderSalesDeals(metrics) {
  const list = document.querySelector(".js-sales-deal-list");
  const count = document.querySelector(".js-sales-deal-count");
  if (!list) return;

  if (count) count.textContent = `${metrics.salesDeals.length} deal${metrics.salesDeals.length === 1 ? "" : "s"}`;

  if (!metrics.salesDeals.length) {
    const text =
      metrics.totalClients === 0
        ? "No deals yet. Add your first client to start the sales pipeline."
        : "No deals match the selected sales filter.";
    list.innerHTML = `<p class="task-empty">${text}</p>`;
    return;
  }

  list.innerHTML = metrics.salesDeals
    .map(
      (client) => `
        <article class="sales-deal-card sales-deal-card--${client.status}">
          <div class="sales-deal-card__main">
            <span class="status-badge status-badge--${client.status}">${STATUS_LABELS[client.status]}</span>
            <div>
              <h5 class="sales-deal-card__title">${escapeHtml(client.name)}</h5>
              <p class="sales-deal-card__company">${escapeHtml(client.company || "Company not added")}</p>
            </div>
          </div>
          <div class="sales-deal-card__meta">
            <span>
              <small>Value</small>
              ${moneyFormatter.format(client.dealValue)}
            </span>
            <span>
              <small>Next step</small>
              ${escapeHtml(getSalesNextStep(client, metrics.tasks))}
            </span>
          </div>
          <a class="btn btn--ghost btn--sm sales-deal-card__link" href="./clients.html">Open Client</a>
        </article>
      `,
    )
    .join("");
}

function bindSalesControls() {
  const targetInput = document.querySelector(".js-sales-target-input");
  const statusFilter = document.querySelector(".js-sales-status-filter");
  const sortSelect = document.querySelector(".js-sales-sort-select");

  targetInput?.addEventListener("change", () => {
    saveSalesSettings({ monthlyTarget: Math.max(Number(targetInput.value) || 0, 0) });
    renderDashboard();
  });

  statusFilter?.addEventListener("change", () => {
    saveSalesSettings({ statusFilter: statusFilter.value });
    renderDashboard();
  });

  sortSelect?.addEventListener("change", () => {
    saveSalesSettings({ sortBy: sortSelect.value });
    renderDashboard();
  });
}

function renderDashboard() {
  const metrics = getDashboardMetrics();

  renderMetricCards(metrics);
  renderPipeline(metrics);
  renderRecentClients(metrics);
  renderSalesControls(metrics);
  renderSalesStages(metrics);
  renderSalesFocus(metrics);
  renderSalesDeals(metrics);

  window.crmDashboardData = {
    getMetrics: getDashboardMetrics,
  };
  window.dispatchEvent(new CustomEvent("crm:dashboarddata:update", { detail: metrics }));
}
