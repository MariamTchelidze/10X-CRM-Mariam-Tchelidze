const dashboardPage = document.querySelector(".dashboardPage");

const TASKS_KEY = "crm_tasks";
const MONTHLY_TARGET = 32000;
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
  const statusCounts = STATUS_ORDER.reduce((counts, status) => ({ ...counts, [status]: 0 }), {});

  clients.forEach((client) => {
    statusCounts[client.status] += 1;
  });

  const totalClients = clients.length;
  const activeDeals = statusCounts.lead + statusCounts.contacted;
  const wonClients = clients.filter((client) => client.status === "won");
  const wonRevenue = wonClients.reduce((sum, client) => sum + client.dealValue, 0);
  const activeTasks = tasks.filter((task) => !task.archived && !task.deleted);
  const pendingTasks = activeTasks.filter((task) => task.status !== "done").length;
  const todayKey = new Date().toISOString().slice(0, 10);
  const dueToday = activeTasks.filter((task) => String(task.dueDate || "").slice(0, 10) === todayKey).length;
  const hotLeads = clients.filter((client) => client.status === "lead" && client.dealValue >= 2500).length;
  const pipelineHealth = totalClients ? Math.round(((statusCounts.lead + statusCounts.contacted + statusCounts.won) / totalClients) * 100) : 0;
  const conversionRate = totalClients ? Math.round((statusCounts.won / totalClients) * 100) : 0;
  const monthlyTargetProgress = Math.min(Math.round((wonRevenue / MONTHLY_TARGET) * 100), 100);
  const recentClients = [...clients].sort((a, b) => getClientDate(b) - getClientDate(a)).slice(0, 5);
  const salesFocus = [...clients]
    .filter((client) => client.status !== "lost")
    .sort((a, b) => b.dealValue - a.dealValue)
    .slice(0, 3);
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
    monthlyTarget: MONTHLY_TARGET,
    monthlyTargetProgress,
    statusCounts,
    recentClients,
    salesFocus,
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
  setText('[data-dashboard-trend="hotLeads"]', "Lead clients with deal value of $2,500 or higher.");
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

function renderSalesFocus(metrics) {
  const list = document.getElementById("sales-focus-list");
  if (!list) return;

  if (!metrics.salesFocus.length) {
    list.innerHTML = '<p class="task-empty">No active sales focus yet.</p>';
    return;
  }

  list.innerHTML = metrics.salesFocus
    .map(
      (client) => `
        <div class="dashboard-list__item">
          <span class="status-badge status-badge--${client.status}">${STATUS_LABELS[client.status]}</span>
          <strong>${escapeHtml(client.name)}</strong>
          <span>${escapeHtml(client.company || "Company not added")} - ${moneyFormatter.format(client.dealValue)}</span>
        </div>
      `,
    )
    .join("");
}

function renderDashboard() {
  const metrics = getDashboardMetrics();

  renderMetricCards(metrics);
  renderPipeline(metrics);
  renderRecentClients(metrics);
  renderSalesFocus(metrics);

  window.crmDashboardData = {
    getMetrics: getDashboardMetrics,
  };
  window.dispatchEvent(new CustomEvent("crm:dashboarddata:update", { detail: metrics }));
}
