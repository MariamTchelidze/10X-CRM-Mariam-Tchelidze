"use strict";

/* --- Toast Notification Helper --- */
(function initToast() {
  const PENDING_TOAST_KEY = "crm_pending_toast";

  /* --- container should exist in HTML document - if doesn't exist - create it --- */
  const ensureContainer = () => {
    let container = document.getElementById("toast-container");

    if (container) return container;

    container = document.createElement("div");
    container.className = "toast-container";
    container.id = "toast-container";
    container.setAttribute("aria-live", "polite"); // screen reader
    container.setAttribute("aria-atomic", "true"); // screen reader
    document.body.append(container);
    return container;
  };

  /* --- visually shown messages: error/success handling --- */

  const show = (message, type = "success") => {
    const container = ensureContainer();
    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    toast.innerHTML = `
      <span class="toast__message">${message}</span>
      <button class="toast__close" type="button" aria-label="Close notification">&times;</button>
    `;

    const close = () => toast.remove();

    toast.querySelector(".toast__close").addEventListener("click", close);
    container.append(toast);
    window.setTimeout(close, 3000);
  };

  /* ---  to secure js storage after page reload --- */

  const queue = (message, type = "success") => {
    sessionStorage.setItem(PENDING_TOAST_KEY, JSON.stringify({ message, type }));
  };

  /* ---  check and display any pending toast notification in sessionStorage --- */
  const showPending = () => {
    try {
      const pendingToast = JSON.parse(sessionStorage.getItem(PENDING_TOAST_KEY) || "null");

      if (!pendingToast) return;

      sessionStorage.removeItem(PENDING_TOAST_KEY);
      show(pendingToast.message, pendingToast.type);
    } catch (error) {
      sessionStorage.removeItem(PENDING_TOAST_KEY);
    }
  };

  window.crmToast = { show, queue };
  showPending();
})();
