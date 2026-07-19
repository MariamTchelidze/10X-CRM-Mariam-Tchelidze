"use strict";

/* --- Dashboard Widget Renderers --- */
(function initDashboardWidgets() {
  const isProtectedPage = document.querySelector(".dashboardPage, .clientsPage, .profilePage");

  if (!isProtectedPage) return;

  const escapeHtml = (value) =>
    String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const spreadsheetRows = [
    ["Client", "Status", "Owner", "Value", "Next Action"],
    ["Alpha Group", "Lead", "Mariam", "$4,200", "Send pricing"],
    ["Nino Consulting", "Contacted", "Sales Team", "$7,800", "Proposal follow-up"],
    ["Blue Tech", "Won", "Account Manager", "$12,500", "Onboarding notes"],
    ["Nova Studio", "In Progress", "Support Team", "$6,100", "Contract draft"],
  ];

  const ensureSpreadsheetModal = () => {
    let modal = document.getElementById("spreadsheet-modal");

    if (modal) return modal;

    modal = document.createElement("section");
    modal.className = "modal spreadsheet-modal";
    modal.id = "spreadsheet-modal";
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="modal__dialog modal__dialog--wide" role="dialog" aria-modal="true">
        <header class="modal__header">
          <div>
            <p class="modal__eyebrow">Editable sheet</p>
            <h2 class="modal__title js-spreadsheet-title">Spreadsheet</h2>
            <p class="modal__description">Edit cells directly in the CRM viewport.</p>
          </div>
          <button class="icon-btn js-spreadsheet-close" type="button" aria-label="Close spreadsheet">
            <img src="./assets/icons/close.svg" data-theme-src-dark="./assets/icons/close.svg" data-theme-src-light="./assets/icons/close-light-theme.svg" alt="" />
          </button>
        </header>
        <div class="modal__body spreadsheet-shell">
          <div class="spreadsheet-grid js-spreadsheet-grid" role="grid" aria-label="Editable CRM spreadsheet"></div>
        </div>
        <footer class="modal__footer">
          <button class="btn btn--ghost js-spreadsheet-close" type="button">Close</button>
          <button class="btn btn--primary js-export-sheet" type="button">Export CSV</button>
        </footer>
      </div>
    `;
    document.body.append(modal);
    modal.querySelectorAll(".js-spreadsheet-close").forEach((button) => button.addEventListener("click", () => closeModal(modal)));
    modal.querySelector(".js-export-sheet")?.addEventListener("click", exportSpreadsheet);
    return modal;
  };

  const openModal = (modal) => {
    modal.hidden = false;
    modal.dataset.modalState = "open";
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const closeModal = (modal) => {
    modal.hidden = true;
    modal.dataset.modalState = "closed";
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  const renderSpreadsheet = (fileName = "clients-pipeline.csv") => {
    const modal = ensureSpreadsheetModal();
    const grid = modal.querySelector(".js-spreadsheet-grid");
    const title = modal.querySelector(".js-spreadsheet-title");

    title.textContent = fileName;
    grid.innerHTML = spreadsheetRows
      .map((row, rowIndex) =>
        row
          .map(
            (cell, colIndex) => `
              <div
                class="spreadsheet-cell${rowIndex === 0 ? " spreadsheet-cell--header" : ""}"
                contenteditable="${rowIndex === 0 ? "false" : "true"}"
                role="gridcell"
                data-row="${rowIndex}"
                data-col="${colIndex}"
              >${escapeHtml(cell)}</div>
            `,
          )
          .join(""),
      )
      .join("");
    openModal(modal);
  };

  const exportSpreadsheet = () => {
    const cells = Array.from(document.querySelectorAll(".spreadsheet-cell"));
    const rows = [];
    cells.forEach((cell) => {
      const row = Number(cell.dataset.row);
      rows[row] ||= [];
      rows[row][Number(cell.dataset.col)] = `"${cell.textContent.replaceAll('"', '""')}"`;
    });
    const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "crm-export.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  document.addEventListener("click", (event) => {
    const file = event.target.closest(".js-open-spreadsheet");
    const exportButton = event.target.closest(".js-export-file");

    if (file) {
      renderSpreadsheet(file.dataset.fileName);
    }

    if (exportButton) {
      renderSpreadsheet("crm-export-preview.csv");
    }
  });

  document.addEventListener("keydown", (event) => {
    const file = event.target.closest(".js-open-spreadsheet");

    if (file && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      renderSpreadsheet(file.dataset.fileName);
    }
  });

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
        ? chartData.monthlyWonValues || [18, 24, 21, 30, 38, 44]
        : type === "pie"
          ? chartData.outcomeValues || [18, 7, 5]
          : chartData.stageMix || [48, 31, 18, 7];
    const labels =
      type === "line"
        ? chartData.monthlyWonLabels || ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
        : type === "pie"
          ? chartData.outcomeLabels || ["Won", "Lost", "Active"]
          : chartData.stageLabels || ["Lead", "Contacted", "Won", "Lost"];
    const max = Math.max(...values, 1);

    context.font = "12px Inter, Arial, sans-serif";
    context.fillStyle = getComputedStyle(document.body).getPropertyValue("--color-text-muted") || "#8ea0b8";

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
