"use strict";

/* --- Dashboard Widget Renderers --- */
(function initDashboardWidgets() {
  const isProtectedPage = document.querySelector(".dashboardPage, .clientsPage, .profilePage");

  if (!isProtectedPage) return;

  const isCanvasDrawable = (canvas) => {
    const rect = canvas.getBoundingClientRect();
    return !canvas.closest("[hidden]") && rect.width > 20 && rect.height > 20;
  };

  const drawChart = (canvas, progress) => {
    if (!isCanvasDrawable(canvas)) return;

    const context = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);

    const type = canvas.dataset.chartType;
    const colors = ["#ff6b1a", "#4c8fea", "#55b975", "#ee5c4c"];
    const metrics = window.crmDashboardData?.getMetrics?.();
    const chartData = metrics?.chartData || {};
    const values =
      type === "line"
        ? chartData.monthlyWonValues || []
        : type === "pie"
          ? chartData.outcomeValues || []
          : chartData.stageMix || [];
    const labels =
      type === "line"
        ? chartData.monthlyWonLabels || []
        : type === "pie"
          ? chartData.outcomeLabels || []
          : chartData.stageLabels || [];
    const max = Math.max(...values, 1);

    context.font = "12px Inter, Arial, sans-serif";
    context.fillStyle = getComputedStyle(document.body).getPropertyValue("--color-text-muted") || "#8ea0b8";

    if (!values.length || values.every((value) => Number(value) === 0)) {
      context.textAlign = "center";
      context.fillText("No chart data yet", rect.width / 2, rect.height / 2);
      context.textAlign = "start";
      return;
    }

    if (type === "pie") {
      const total = values.reduce((sum, value) => sum + value, 0) || 1;
      let start = -Math.PI / 2;
      values.forEach((value, index) => {
        const slice = (value / total) * Math.PI * 2 * progress;
        context.beginPath();
        context.moveTo(rect.width / 2, rect.height / 2);
        context.arc(rect.width / 2, rect.height / 2, Math.min(rect.width, rect.height) * 0.32, start, start + slice);
        context.closePath();
        context.fillStyle = colors[index];
        context.fill();
        start += (value / total) * Math.PI * 2;
      });
      labels.forEach((label, index) => {
        context.fillStyle = colors[index];
        context.fillText(label, 16, 24 + index * 20);
      });
      return;
    }

    if (type === "line") {
      context.strokeStyle = "#4c8fea";
      context.lineWidth = 3;
      context.beginPath();
      values.forEach((value, index) => {
        const x = 24 + index * ((rect.width - 48) / (values.length - 1));
        const y = rect.height - 28 - (value / max) * (rect.height - 56) * progress;
        index === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
        context.fillStyle = "#4c8fea";
        context.fillText(labels[index], x - 8, rect.height - 8);
      });
      context.stroke();
      return;
    }

    const barWidth = (rect.width - 64) / values.length;
    values.forEach((value, index) => {
      const barHeight = (value / max) * (rect.height - 58) * progress;
      const x = 24 + index * barWidth;
      const y = rect.height - 32 - barHeight;
      context.fillStyle = colors[index];
      context.fillRect(x, y, barWidth * 0.62, barHeight);
      context.fillStyle = getComputedStyle(document.body).getPropertyValue("--color-text-muted") || "#8ea0b8";
      context.fillText(labels[index], x, rect.height - 10);
    });
  };

  const animateCharts = () => {
    const canvases = Array.from(document.querySelectorAll(".js-crm-chart")).filter(isCanvasDrawable);
    let startTime = 0;
    const duration = 900;

    const frame = (time) => {
      startTime ||= time;
      const progress = Math.min((time - startTime) / duration, 1);
      canvases.forEach((canvas) => drawChart(canvas, progress));
      if (progress < 1) requestAnimationFrame(frame);
    };

    if (canvases.length) requestAnimationFrame(frame);
  };

  const scheduleCharts = () => {
    requestAnimationFrame(() => requestAnimationFrame(animateCharts));
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
