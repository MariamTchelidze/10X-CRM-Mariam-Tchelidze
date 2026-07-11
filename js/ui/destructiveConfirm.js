"use strict";

(function initDestructiveConfirm() {
  const modal = document.querySelector(".js-destructive-confirm");
  const confirmButton = modal?.querySelector(".js-global-delete-confirm");
  const cancelButtons = modal?.querySelectorAll(".js-global-delete-cancel");
  const confirmedTargets = new WeakSet();
  let pendingTarget = null;

  if (!modal || !confirmButton) return;

  const isDeleteControl = (element) => {
    if (!element || element.dataset.skipDeleteConfirm !== undefined) return false;
    if (element.dataset.modalTarget === "#delete-account-modal") return false;
    if (element.closest("[data-skip-delete-confirm]")) return false;
    if (element.closest("#global-delete-confirm-modal")) return false;
    if (element.closest("#delete-client-modal")) return false;
    if (element.closest("#delete-task-modal")) return false;
    if (element.dataset.taskAction === "delete") return false;

    const text = element.textContent || "";
    const label = element.getAttribute("aria-label") || "";
    const action = element.dataset.taskAction || element.dataset.clientAction || "";
    const classes = element.className || "";

    return /delete|remove/i.test(`${text} ${label} ${action} ${classes}`);
  };

  const openModal = () => {
    modal.hidden = false;
    modal.dataset.modalState = "open";
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    window.requestAnimationFrame(() => confirmButton.focus({ preventScroll: true }));
  };

  const closeModal = () => {
    modal.hidden = true;
    modal.dataset.modalState = "closed";
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    pendingTarget = null;
  };

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target.closest("button, a");

      if (!isDeleteControl(target)) return;

      if (confirmedTargets.has(target)) {
        confirmedTargets.delete(target);
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      pendingTarget = target;
      openModal();
    },
    true,
  );

  confirmButton.addEventListener("click", () => {
    const target = pendingTarget;
    closeModal();

    if (!target) return;

    confirmedTargets.add(target);
    target.click();
  });

  cancelButtons.forEach((button) => button.addEventListener("click", closeModal));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      event.preventDefault();
      closeModal();
    }
  });
})();
