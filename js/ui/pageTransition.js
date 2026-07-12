"use strict";

(function initPageTransition() {
  const ENTER_KEY = "crm_page_transition_enter";
  const EXIT_DURATION = 260;
  const ENTER_DURATION = 220;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ensureOverlay = () => {
    let overlay = document.querySelector(".page-transition-overlay");

    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.className = "page-transition-overlay";
    overlay.setAttribute("aria-hidden", "true");
    document.body.append(overlay);
    return overlay;
  };

  const removeEnterState = () => {
    document.body.classList.remove("is-page-entering", "is-page-enter-ready");
  };

  const playEnter = () => {
    if (prefersReducedMotion || !sessionStorage.getItem(ENTER_KEY)) return;

    sessionStorage.removeItem(ENTER_KEY);
    document.body.classList.add("is-page-entering");

    window.requestAnimationFrame(() => {
      document.body.classList.add("is-page-enter-ready");
      window.setTimeout(removeEnterState, ENTER_DURATION);
    });
  };

  const transitionTo = (destination, options = {}) => {
    const { beforeRedirect } = options;

    if (prefersReducedMotion) {
      beforeRedirect?.();
      window.location.href = destination;
      return;
    }

    ensureOverlay();
    document.body.classList.add("is-page-transitioning", "is-page-exiting");
    sessionStorage.setItem(ENTER_KEY, "true");

    window.setTimeout(() => {
      beforeRedirect?.();
      window.location.href = destination;
    }, EXIT_DURATION);
  };

  window.crmPageTransition = { transitionTo };
  playEnter();
})();
