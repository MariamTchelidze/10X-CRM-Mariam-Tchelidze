"use strict";

(function initModalController() {
  const OPEN_CLASS = "modal-open";
  const MODAL_SELECTOR = ".modal";
  const FOCUSABLE_SELECTOR = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  let activeModal = null;
  let activeTrigger = null;

  const getFocusableElements = (modal) => {
    return Array.from(modal.querySelectorAll(FOCUSABLE_SELECTOR)).filter((element) => {
      return !element.hidden && element.offsetParent !== null;
    });
  };

  const getModalFromTarget = (target) => {
    if (!target) return null;

    const modalId = target.startsWith("#") ? target.slice(1) : target;
    return document.getElementById(modalId);
  };

  const getInitialFocusElement = (modal) => {
    const preferredSelector = modal.dataset.modalInitialFocus;
    const preferredElement = preferredSelector ? modal.querySelector(preferredSelector) : null;

    if (preferredElement) return preferredElement;

    return getFocusableElements(modal)[0] || modal.querySelector("[role='dialog']") || modal;
  };

  const openModal = (modal, trigger = null) => {
    if (!modal) return;

    if (activeModal && activeModal !== modal) {
      closeModal(activeModal, false);
    }

    activeModal = modal;
    activeTrigger = trigger;
    modal.hidden = false;
    modal.dataset.modalState = "open";
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add(OPEN_CLASS);

    window.requestAnimationFrame(() => {
      getInitialFocusElement(modal).focus({ preventScroll: true });
    });
  };

  function closeModal(modal = activeModal, shouldRestoreFocus = true) {
    if (!modal) return;

    modal.dataset.modalState = "closed";
    modal.setAttribute("aria-hidden", "true");
    modal.hidden = true;

    if (activeModal === modal) {
      activeModal = null;
      document.body.classList.remove(OPEN_CLASS);

      if (shouldRestoreFocus && activeTrigger) {
        activeTrigger.focus({ preventScroll: true });
      }

      activeTrigger = null;
    }
  }

  const trapFocus = (event) => {
    if (!activeModal || event.key !== "Tab") return;

    const focusableElements = getFocusableElements(activeModal);

    if (!focusableElements.length) {
      event.preventDefault();
      activeModal.focus({ preventScroll: true });
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const isLeavingStart = event.shiftKey && document.activeElement === firstElement;
    const isLeavingEnd = !event.shiftKey && document.activeElement === lastElement;

    if (isLeavingStart) {
      event.preventDefault();
      lastElement.focus({ preventScroll: true });
    }

    if (isLeavingEnd) {
      event.preventDefault();
      firstElement.focus({ preventScroll: true });
    }
  };

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-modal-target]");

    if (trigger) {
      event.preventDefault();
      openModal(getModalFromTarget(trigger.dataset.modalTarget), trigger);
      return;
    }

    const closeButton = event.target.closest("[data-modal-close]");

    if (closeButton) {
      event.preventDefault();
      closeModal(closeButton.closest(MODAL_SELECTOR));
      return;
    }

    if (event.target.matches(MODAL_SELECTOR)) {
      closeModal(event.target);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!activeModal) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeModal(activeModal);
      return;
    }

    trapFocus(event);
  });
})();