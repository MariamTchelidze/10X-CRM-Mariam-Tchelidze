"use strict";

/* --- Simple Report Chart Renderer --- */
(function initDashboardWidgets() {
  const protectedPage = document.querySelector(".dashboardPage, .clientsPage, .profilePage");
  if (!protectedPage) return;

  const chartColors = ["#ff6b1a", "#4c8fea", "#55b975", "#ee5c4c"];

  const isCanvasReady = (canvas) => {
    const rect = canvas.getBoundingClientRect();
    return !canvas.closest("[hidden]") && rect.width > 20 && rect.height > 20;
  };

  const getChartItems = (canvas) => {
    const metrics = window.crmDashboardData?.getMetrics?.();
    const chartData = metrics?.chartData || {};

    if (canvas.dataset.chartType === "line") {
      return (chartData.monthlyWonLabels || []).map((label, index) => ({
        label,
        value: Number(chartData.monthlyWonValues?.[index]) || 0,
      }));
    }

    if (canvas.dataset.chartType === "pie") {
      return (chartData.outcomeLabels || []).map((label, index) => ({
        label,
        value: Number(chartData.outcomeValues?.[index]) || 0,
      }));
    }

    return (chartData.stageLabels || []).map((label, index) => ({
      label,
      value: Number(chartData.stageMix?.[index]) || 0,
    }));
  };

  const prepareCanvas = (canvas) => {
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const context = canvas.getContext("2d");

    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);

    return { context, width: rect.width, height: rect.height };
  };

  const drawBarChart = (canvas) => {
    if (!isCanvasReady(canvas)) return;

    const items = getChartItems(canvas);
    const { context, width, height } = prepareCanvas(canvas);
    const textColor = getComputedStyle(document.body).getPropertyValue("--color-text-muted") || "#8ea0b8";
    const maxValue = Math.max(...items.map((item) => item.value), 1);

    context.font = "12px Inter, Arial, sans-serif";
    context.textAlign = "center";

    if (!items.length || items.every((item) => item.value === 0)) {
      context.fillStyle = textColor;
      context.fillText("No chart data yet", width / 2, height / 2);
      return;
    }

    const gap = 18;
    const chartWidth = width - gap * 2;
    const barWidth = chartWidth / items.length;

    items.forEach((item, index) => {
      const x = gap + index * barWidth;
      const barHeight = (item.value / maxValue) * (height - 58);
      const y = height - 32 - barHeight;

      context.fillStyle = chartColors[index % chartColors.length];
      context.fillRect(x + barWidth * 0.18, y, barWidth * 0.64, barHeight);

      context.fillStyle = textColor;
      context.fillText(item.label, x + barWidth / 2, height - 10);
    });
  };

  const renderCharts = () => {
    document.querySelectorAll(".js-crm-chart").forEach(drawBarChart);
  };

  const scheduleCharts = () => {
    requestAnimationFrame(renderCharts);
  };

  scheduleCharts();
  window.addEventListener("resize", scheduleCharts);
  window.addEventListener("crm:themechange", scheduleCharts);
  window.addEventListener("crm:dashboarddata:update", scheduleCharts);
  window.addEventListener("hashchange", scheduleCharts);
  document.addEventListener("click", (event) => {
    if (event.target.closest('[data-dashboard-section-link="reports"]')) {
      scheduleCharts();
    }
  });
})();
