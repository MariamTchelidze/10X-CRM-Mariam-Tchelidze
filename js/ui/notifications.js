"use strict";

/* --- Notification Center Controller --- */
(function initGlobalNotifications() {
  /* --- Notification storage key is shared with tasks and communication events. --- */
  const STORAGE_KEY = "crm_task_notifications";

  /* --- Notification Storage --- */
  const readNotifications = () => {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  };

  const saveNotifications = (notifications) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      // Notification UI still updates for this page if storage is unavailable.
    }
  };

  const createId = () => {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `notification-${window.crypto.randomUUID()}`;
    }

    return `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  const escapeHtml = (value) =>
    String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const formatDateTime = (value) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Just now";

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* --- Current language helpers keep stored notifications in English and translate only the UI output. --- */
  const getLanguage = () => window.crmI18n?.getLanguage?.() || document.documentElement.lang || "en";
  const isGeorgian = () => getLanguage() === "ka";

  const notificationUiText = (english, georgian) => (isGeorgian() ? georgian : english);

  const translateNotificationMessage = (message) => {
    const text = String(message || "");

    if (!isGeorgian()) return text;

    const exactMessages = {
      "New call note saved to Profile Call History.": "პროფილის ზარების ისტორიაში ახალი ზარის შენიშვნა შეინახა.",
      "Phone call blocked because calling is disabled.": "ზარი დაიბლოკა, რადგან დარეკვა გამორთულია.",
      "CRM Phone started a call.": "CRM ტელეფონმა ზარი დაიწყო.",
      "10X SensAI replied with CRM guidance.": "10X SensAI-მ CRM რეკომენდაცია დაგიბრუნათ.",
    };

    if (exactMessages[text]) return exactMessages[text];

    const dynamicMessages = [
      {
        pattern: /^New Messenger message sent to (.+)\.$/,
        render: ([, recipient]) => `Messenger-ის ახალი შეტყობინება გაიგზავნა: ${recipient}.`,
      },
      {
        pattern: /^New task assigned to (.+): (.+)$/,
        render: ([, assignee, taskTitle]) => `ახალი დავალება მიენიჭა ${assignee}-ს: ${taskTitle}`,
      },
      {
        pattern: /^(.+) was reassigned to (.+)\.$/,
        render: ([, taskTitle, assignee]) => `${taskTitle} გადაეცა ${assignee}-ს.`,
      },
      {
        pattern: /^(.+) commented on (.+) and mentioned (.+)\.$/,
        render: ([, author, taskTitle, teammate]) => `${author}-მა დატოვა კომენტარი ${taskTitle}-ზე და მონიშნა ${teammate}.`,
      },
      {
        pattern: /^(.+) commented on (.+)\.$/,
        render: ([, author, taskTitle]) => `${author}-მა დატოვა კომენტარი ${taskTitle}-ზე.`,
      },
      {
        pattern: /^Follow up: (.+)$/,
        render: ([, clientName]) => `შეხსენება: ${clientName}`,
      },
    ];

    const match = dynamicMessages
      .map(({ pattern, render }) => {
        const result = text.match(pattern);
        return result ? render(result) : "";
      })
      .find(Boolean);

    return match || text;
  };

  /* --- Runtime notification state mirrors localStorage for quick rendering. --- */
  let notifications = readNotifications();

  /* --- Normalizer gives each notification consistent id, status, date, and task link. --- */
  const normalizeNotification = (notification) => ({
    ...notification,
    status: notification.status || (notification.read ? "read" : "unread"),
    selected: Boolean(notification.selected),
  });

  const render = () => {
    notifications = readNotifications().map(normalizeNotification);
    const unreadCount = notifications.filter((notification) => notification.status !== "read" && !notification.read).length;

    document.querySelectorAll(".js-notification-count").forEach((counter) => {
      counter.textContent = String(unreadCount);
      counter.hidden = unreadCount === 0;
    });

    document.querySelectorAll(".js-notification-list").forEach((list) => {
      if (!notifications.length) {
        list.innerHTML = `<p class="task-empty">${notificationUiText("No notifications yet.", "შეტყობინებები ჯერ არ არის.")}</p>`;
        return;
      }

      list.innerHTML = notifications
        .map(
          (notification) => `
            <article tabindex="0" role="button" class="notification-item js-notification-item${notification.status === "read" || notification.read ? "" : " notification-item--unread"}"
              data-notification-id="${notification.id}"
              data-notification-task-id="${escapeHtml(notification.taskId || "")}">
              <span class="notification-item__select" data-skip-delete-confirm>
                <input class="js-notification-select" type="checkbox" data-notification-id="${notification.id}" ${notification.selected ? "checked" : ""} aria-label="${notificationUiText("Select notification", "შეტყობინების მონიშვნა")}" />
              </span>
              <span class="notification-item__message">${escapeHtml(translateNotificationMessage(notification.message))}</span>
              <time class="notification-item__time">${formatDateTime(notification.createdAt)}</time>
            </article>
          `,
        )
        .join("");
    });
  };

  /* --- Public add helper lets other modules create notifications. --- */
  const add = (message, taskId = "") => {
    notifications = [
      {
        id: createId(),
        message,
        taskId,
        read: false,
        status: "unread",
        selected: false,
        createdAt: new Date().toISOString(),
      },
      ...readNotifications(),
    ];
    saveNotifications(notifications);
    render();
  };

  document.addEventListener("click", (event) => {
    if (event.target.closest(".js-notification-select")) return;

    const item = event.target.closest(".js-notification-item");
    if (!item) return;

    notifications = readNotifications().map((notification) =>
      notification.id === item.dataset.notificationId ? { ...notification, read: true, status: "read" } : notification,
    );
    saveNotifications(notifications);
    render();

    if (item.dataset.notificationTaskId && document.querySelector(".js-open-task-details-helper")) {
      document.dispatchEvent(new CustomEvent("crm:open-task", { detail: { taskId: item.dataset.notificationTaskId } }));
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    const item = event.target.closest(".js-notification-item");
    if (!item) return;

    event.preventDefault();
    item.click();
  });

  document.addEventListener("change", (event) => {
    const checkbox = event.target.closest(".js-notification-select");
    if (!checkbox) return;

    notifications = readNotifications().map((notification) =>
      notification.id === checkbox.dataset.notificationId ? { ...notification, selected: checkbox.checked } : notification,
    );
    saveNotifications(notifications);
    render();
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest(".js-clear-notifications")) {
      notifications = readNotifications().map((notification) => ({ ...notification, read: true, status: "read" }));
      saveNotifications(notifications);
      render();
    }

    if (event.target.closest(".js-select-read-notifications")) {
      let selectedCount = 0;

      notifications = readNotifications().map((notification) => {
        const isRead = notification.status === "read" || notification.read;

        if (isRead) selectedCount += 1;

        return { ...notification, selected: isRead };
      });

      saveNotifications(notifications);
      render();
      window.crmToast?.show(
        selectedCount
          ? notificationUiText("All read notifications selected.", "ყველა წაკითხული შეტყობინება მონიშნულია.")
          : notificationUiText("No read notifications to select.", "წაკითხული შეტყობინებები მოსანიშნად არ არის."),
        selectedCount ? "success" : "info",
      );
    }

    if (event.target.closest(".js-delete-selected-notifications")) {
      notifications = readNotifications().filter((notification) => !notification.selected);
      saveNotifications(notifications);
      render();
    }

    if (event.target.closest(".js-delete-read-notifications")) {
      notifications = readNotifications().filter((notification) => !(notification.status === "read" || notification.read));
      saveNotifications(notifications);
      render();
    }
  });

  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) render();
  });

  window.addEventListener("crm:languagechange", render);

  window.crmNotifications = { add, render };
  render();
})();
