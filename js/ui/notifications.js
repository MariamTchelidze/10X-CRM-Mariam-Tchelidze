"use strict";

/* --- Notification Center Controller --- */
(function initGlobalNotifications() {
  const STORAGE_KEY = "crm_task_notifications";
  const data = window.crmData;

  /* --- Storage helpers keep notifications available even if the backend is offline. --- */
  const readNotifications = () => {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  };

  const saveNotifications = (items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      // The current page can still render the in-memory state.
    }
  };

  const createId = () =>
    window.crypto?.randomUUID
      ? `notification-${window.crypto.randomUUID()}`
      : `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

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

  /* --- Normalizers give localStorage and MongoDB notifications the same shape. --- */
  const isRead = (notification) => notification.status === "read" || notification.read === true;

  const normalizeNotification = (notification = {}) => ({
    id: notification.id || notification._id || createId(),
    message: notification.message || "New CRM update.",
    taskId: notification.taskId || "",
    read: isRead(notification),
    status: isRead(notification) ? "read" : "unread",
    selected: Boolean(notification.selected),
    createdAt: notification.createdAt || new Date().toISOString(),
  });

  let notifications = readNotifications().map(normalizeNotification);

  const setNotifications = (items) => {
    notifications = Array.isArray(items) ? items.map(normalizeNotification) : [];
    saveNotifications(notifications);
    render();
  };

  const syncFromBackend = (promise) => {
    promise?.then((items) => setNotifications(items)).catch(() => render());
  };

  /* --- Renderer updates counters, empty state, and selectable notification cards. --- */
  function render() {
    notifications = readNotifications().map(normalizeNotification);
    const unreadCount = notifications.filter((notification) => !isRead(notification)).length;

    document.querySelectorAll(".js-notification-count").forEach((counter) => {
      counter.textContent = String(unreadCount);
      counter.hidden = unreadCount === 0;
    });

    document.querySelectorAll(".js-notification-list").forEach((list) => {
      if (!notifications.length) {
        list.innerHTML = '<p class="task-empty">No notifications yet.</p>';
        return;
      }

      list.innerHTML = notifications
        .map(
          (notification) => `
            <article
              class="notification-item js-notification-item${isRead(notification) ? "" : " notification-item--unread"}"
              data-notification-id="${escapeHtml(notification.id)}"
              data-notification-task-id="${escapeHtml(notification.taskId)}"
              role="button"
              tabindex="0"
            >
              <span class="notification-item__select" data-skip-delete-confirm>
                <input
                  class="js-notification-select"
                  type="checkbox"
                  data-notification-id="${escapeHtml(notification.id)}"
                  ${notification.selected ? "checked" : ""}
                  aria-label="Select notification"
                />
              </span>
              <span class="notification-item__message">${escapeHtml(notification.message)}</span>
              <time class="notification-item__time">${formatDateTime(notification.createdAt)}</time>
            </article>
          `,
        )
        .join("");
    });
  }

  /* --- Public API lets tasks, reminders, and bonus UI add updates. --- */
  const add = (message, taskId = "") => {
    const nextNotification = normalizeNotification({
      id: createId(),
      message,
      taskId,
      createdAt: new Date().toISOString(),
    });

    setNotifications([nextNotification, ...readNotifications()]);

    data?.postNotification?.(nextNotification)
      .then((apiNotification) => {
        if (!apiNotification) return;

        setNotifications(
          readNotifications().map((notification) =>
            notification.id === nextNotification.id ? apiNotification : notification,
          ),
        );
      })
      .catch(() => {});
  };

  const loadNotifications = async () => {
    if (!data?.fetchNotifications || !data?.hasApiSession?.()) return;

    try {
      setNotifications(await data.fetchNotifications());
    } catch (error) {
      render();
    }
  };

  /* --- Click helpers manage read state, selection, cleanup, and task linking. --- */
  const markNotificationRead = (notificationId) => {
    setNotifications(
      readNotifications().map((notification) =>
        notification.id === notificationId ? { ...notification, read: true, status: "read" } : notification,
      ),
    );
    data?.updateNotificationRequest?.(notificationId, { read: true }).catch(() => {});
  };

  const openLinkedTask = (taskId) => {
    if (!taskId || !document.querySelector(".js-open-task-details-helper")) return;
    document.dispatchEvent(new CustomEvent("crm:open-task", { detail: { taskId } }));
  };

  document.addEventListener("click", (event) => {
    if (event.target.closest(".js-notification-select")) return;

    const item = event.target.closest(".js-notification-item");
    if (!item) return;

    markNotificationRead(item.dataset.notificationId);
    openLinkedTask(item.dataset.notificationTaskId);
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

    setNotifications(
      readNotifications().map((notification) =>
        notification.id === checkbox.dataset.notificationId
          ? { ...notification, selected: checkbox.checked }
          : notification,
      ),
    );
    data?.updateNotificationRequest?.(checkbox.dataset.notificationId, { selected: checkbox.checked }).catch(() => {});
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest(".js-clear-notifications")) {
      setNotifications(readNotifications().map((notification) => ({ ...notification, read: true, status: "read" })));
      syncFromBackend(data?.markAllNotificationsRead?.());
    }

    if (event.target.closest(".js-select-read-notifications")) {
      const nextNotifications = readNotifications().map((notification) => ({
        ...notification,
        selected: isRead(notification),
      }));
      const selectedCount = nextNotifications.filter((notification) => notification.selected).length;

      setNotifications(nextNotifications);
      syncFromBackend(data?.selectReadNotifications?.());
      window.crmToast?.show(
        selectedCount ? "All read notifications selected." : "No read notifications to select.",
        selectedCount ? "success" : "info",
      );
    }

    if (event.target.closest(".js-delete-selected-notifications")) {
      setNotifications(readNotifications().filter((notification) => !notification.selected));
      syncFromBackend(data?.deleteSelectedNotifications?.());
    }

    if (event.target.closest(".js-delete-read-notifications")) {
      setNotifications(readNotifications().filter((notification) => !isRead(notification)));
      syncFromBackend(data?.deleteReadNotifications?.());
    }
  });

  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) render();
  });

  window.crmNotifications = { add, render, load: loadNotifications };
  render();
  loadNotifications();
})();
