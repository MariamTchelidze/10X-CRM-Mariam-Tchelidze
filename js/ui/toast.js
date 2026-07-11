"use strict";

(function initToast() {
  const ensureContainer = () => {
    let container = document.getElementById("toast-container");

    if (container) return container;

    container = document.createElement("div");
    container.className = "toast-container";
    container.id = "toast-container";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "true");
    document.body.append(container);
    return container;
  };

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

  window.crmToast = { show };
})();
