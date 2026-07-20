"use strict";

/* --- Page Transition Helpers --- */
(function initPageTransition() {
  const EXIT_DURATION = 190;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const transitionTo = (destination, options = {}) => {
    const { beforeRedirect } = options;

    if (prefersReducedMotion || !document.querySelector(".auth")) {
      beforeRedirect?.();
      window.location.href = destination;
      return;
    }

    document.body.classList.add("is-auth-page-exiting");

    window.setTimeout(() => {
      beforeRedirect?.();
      window.location.href = destination;
    }, EXIT_DURATION);
  };

  window.crmPageTransition = { transitionTo };
})();
