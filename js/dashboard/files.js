"use strict";

/* --- CRM Files Center --- */
(function initDashboardFiles() {
  const dashboardPage = document.querySelector(".dashboardPage");
  const storage = window.crmStorage;
  const constants = window.crmConstants;

  if (!dashboardPage || !storage || !constants) return;

  const TASKS_KEY = "crm_tasks";
  const FILE_LIMIT = 40;
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

  const writeFiles = (files) => {
    storage.write(constants.FILES_KEY, Array.isArray(files) ? files.slice(0, FILE_LIMIT) : []);
    window.dispatchEvent(new CustomEvent("crm:files:update", { detail: files }));
  };

  const getFiles = () => readArray(constants.FILES_KEY);
  const getClients = () => readArray(constants.CLIENTS_KEY);
  const getTasks = () => readArray(TASKS_KEY);
  const getActivity = () => readArray(constants.ACTIVITY_KEY);

  const createId = () => {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return `file-${window.crypto.randomUUID()}`;
    return `file-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  };

  const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Recently";
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatus = (value) => String(value || "lead").trim().toLowerCase();

  const normalizeRows = (rows) => {
    const safeRows = Array.isArray(rows) && rows.length ? rows : [["No data"]];
    const maxColumns = Math.max(...safeRows.map((row) => (Array.isArray(row) ? row.length : 1)), 1);

    return safeRows.map((row) => {
      const safeRow = Array.isArray(row) ? row : [row];
      return Array.from({ length: maxColumns }, (_, index) => safeRow[index] ?? "");
    });
  };

  const downloadCsv = (fileName, rows) => {
    const csv = normalizeRows(rows)
      .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const buildClientRows = () => [
    ["Client", "Company", "Email", "Phone", "Status", "Deal Value", "Country", "Created At"],
    ...getClients().map((client) => [
      client.name || "",
      client.company || "",
      client.email || "",
      client.phone || "",
      client.status || "lead",
      client.dealValue || 0,
      client.countryLabel || client.country || "",
      client.createdAt || "",
    ]),
  ];

  const buildSalesRows = () => [
    ["Client", "Company", "Status", "Deal Value", "Open Tasks", "Reminder"],
    ...getClients().map((client) => {
      const clientName = String(client.name || "").toLowerCase();
      const clientCompany = String(client.company || "").toLowerCase();
      const openTasks = getTasks().filter((task) => {
        if (task.archived || task.deleted || task.status === "done") return false;
        const taskClient = String(task.client || "").toLowerCase();
        return taskClient && (taskClient === clientName || taskClient === clientCompany);
      });

      return [
        client.name || "",
        client.company || "",
        getStatus(client.status),
        client.dealValue || 0,
        openTasks.length,
        client.reminderAt || "No reminder",
      ];
    }),
  ];

  const buildTaskRows = () => [
    ["Title", "Client", "Status", "Priority", "Due Date", "Assignee", "Archived", "Deleted"],
    ...getTasks().map((task) => [
      task.title || "",
      task.client || "",
      task.status || "",
      task.priority || "",
      task.dueDate || task.dueAt || "",
      task.assignee || "",
      task.archived ? "Yes" : "No",
      task.deleted ? "Yes" : "No",
    ]),
  ];

  const buildActivityRows = () => [
    ["Title", "Type", "Status", "Related", "Summary", "Created At"],
    ...getActivity().map((activity) => [
      activity.title || "",
      activity.type || "",
      activity.status || "",
      activity.relatedLabel || "",
      activity.summary || "",
      activity.createdAt || "",
    ]),
  ];

  const getExportConfig = (type) => {
    const configs = {
      clients: {
        label: "Clients",
        filePrefix: "crm-clients",
        description: "Current client records exported from CRM storage.",
        rows: buildClientRows,
      },
      sales: {
        label: "Sales Pipeline",
        filePrefix: "crm-sales-pipeline",
        description: "Sales stages, deal values, reminders, and open task counts.",
        rows: buildSalesRows,
      },
      tasks: {
        label: "Tasks",
        filePrefix: "crm-tasks",
        description: "Task board records exported from local CRM storage.",
        rows: buildTaskRows,
      },
      activity: {
        label: "Activity",
        filePrefix: "crm-activity",
        description: "Recorded CRM activity timeline entries.",
        rows: buildActivityRows,
      },
    };

    return configs[type] || configs.clients;
  };

  const createFileRecord = (type) => {
    const config = getExportConfig(type);
    const rows = normalizeRows(config.rows());
    const createdAt = new Date().toISOString();
    const fileName = `${config.filePrefix}-${createdAt.slice(0, 10)}.csv`;

    return {
      id: createId(),
      name: fileName,
      type: "csv",
      source: config.label,
      description: config.description,
      rowCount: Math.max(rows.length - 1, 0),
      columnCount: rows[0]?.length || 0,
      createdAt,
      rows,
    };
  };

  const getIconMarkup = (name, className = "file-item__icon") => {
    const lightMap = {
      data: "data-light-theme.svg",
      download: "download-light-theme.svg",
      Delete: "Delete-light-theme.svg",
    };

    return `
      <img
        src="./assets/icons/${name}.svg"
        data-theme-src-dark="./assets/icons/${name}.svg"
        data-theme-src-light="./assets/icons/${lightMap[name] || `${name}-light-theme.svg`}"
        alt=""
        class="${className}"
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

  const renderFiles = () => {
    const list = document.querySelector(".js-file-list");
    if (!list) return;

    const files = getFiles();
    if (!files.length) {
      list.innerHTML = '<p class="task-empty">No files yet. Export CRM data to create your first file.</p>';
      return;
    }

    list.innerHTML = files
      .map(
        (file) => `
          <article class="file-item file-item--record" data-file-id="${escapeHtml(file.id)}">
            <button
              class="file-item__open js-open-crm-file"
              type="button"
              data-file-id="${escapeHtml(file.id)}"
              aria-label="Open ${escapeHtml(file.name)}"
            >
              ${getIconMarkup("data")}
              <span class="file-item__content">
                <strong class="file-item__title">${escapeHtml(file.name)}</strong>
                <span class="file-item__meta">
                  ${escapeHtml(file.source)} - ${file.rowCount || 0} rows - ${file.columnCount || 0} columns - ${formatDate(file.createdAt)}
                </span>
                <span class="file-item__description">${escapeHtml(file.description || "CRM exported file")}</span>
              </span>
            </button>
            <button class="icon-btn file-item__delete js-delete-crm-file" type="button" data-file-id="${escapeHtml(file.id)}" aria-label="Delete file">
              ${getIconMarkup("Delete", "")}
            </button>
          </article>
        `,
      )
      .join("");
    updateThemeAssets(list);
  };

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
            <p class="modal__eyebrow">CSV preview</p>
            <h2 class="modal__title js-spreadsheet-title">Exported file</h2>
            <p class="modal__description">Preview exported CRM data inside the workspace. Editing is prepared for future backend file tools.</p>
          </div>
          <button class="icon-btn js-spreadsheet-close" type="button" aria-label="Close spreadsheet">
            <img src="./assets/icons/close.svg" data-theme-src-dark="./assets/icons/close.svg" data-theme-src-light="./assets/icons/close-light-theme.svg" alt="" />
          </button>
        </header>
        <div class="modal__body spreadsheet-shell">
          <div class="spreadsheet-grid js-spreadsheet-grid" role="grid" aria-label="CRM CSV preview"></div>
        </div>
        <footer class="modal__footer">
          <button class="btn btn--ghost js-spreadsheet-close" type="button">Close</button>
        </footer>
      </div>
    `;
    document.body.append(modal);
    modal.querySelectorAll(".js-spreadsheet-close").forEach((button) => button.addEventListener("click", () => closeModal(modal)));
    updateThemeAssets(modal);
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

  const openSpreadsheet = (file) => {
    const modal = ensureSpreadsheetModal();
    const grid = modal.querySelector(".js-spreadsheet-grid");
    const title = modal.querySelector(".js-spreadsheet-title");
    const rows = normalizeRows(file.rows);
    const columnCount = rows[0]?.length || 1;

    title.textContent = file.name;
    grid.style.gridTemplateColumns = `repeat(${columnCount}, minmax(14rem, 1fr))`;
    grid.innerHTML = rows
      .map((row, rowIndex) =>
        row
          .map(
            (cell, colIndex) => `
              <div
                class="spreadsheet-cell${rowIndex === 0 ? " spreadsheet-cell--header" : ""}"
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

  const handleExport = () => {
    const type = document.querySelector(".js-file-export-type")?.value || "clients";
    const file = createFileRecord(type);
    const files = [file, ...getFiles()].slice(0, FILE_LIMIT);

    writeFiles(files);
    renderFiles();
    downloadCsv(file.name, file.rows);
    window.crmToast?.show(`${file.source} file exported.`, "success");
    window.crmActivity?.add({
      type: "general",
      icon: "data",
      title: `${file.source} file exported`,
      summary: `${file.name} was created in Files.`,
      status: "Exported",
      relatedLabel: file.name,
      actionHref: "./dashboard.html#files",
      actionLabel: "Open Files",
    });
  };

  const deleteFile = (fileId) => {
    const file = getFiles().find((item) => item.id === fileId);
    writeFiles(getFiles().filter((item) => item.id !== fileId));
    renderFiles();
    window.crmToast?.show("File deleted.", "success");

    if (file) {
      window.crmActivity?.add({
        type: "general",
        icon: "Delete",
        title: "File deleted",
        summary: `${file.name} was removed from Files.`,
        status: "Deleted",
        relatedLabel: file.name,
        actionHref: "./dashboard.html#files",
        actionLabel: "Open Files",
      });
    }
  };

  document.addEventListener("click", (event) => {
    const exportButton = event.target.closest(".js-export-file");
    const openButton = event.target.closest(".js-open-crm-file");
    const deleteButton = event.target.closest(".js-delete-crm-file");

    if (exportButton) {
      handleExport();
      return;
    }

    if (openButton) {
      const file = getFiles().find((item) => item.id === openButton.dataset.fileId);
      if (file) openSpreadsheet(file);
      return;
    }

    if (deleteButton) {
      deleteFile(deleteButton.dataset.fileId);
    }
  });

  window.addEventListener("storage", renderFiles);
  window.addEventListener("crm:files:update", renderFiles);
  window.addEventListener("crm:themechange", () => updateThemeAssets(document));

  renderFiles();
})();
