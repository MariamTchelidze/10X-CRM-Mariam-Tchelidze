"use strict";

(function initPageTransition() {
  const EXIT_DURATION = 440;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const transitionTo = (destination, options = {}) => {
    const { beforeRedirect } = options;

    if (prefersReducedMotion || !document.querySelector(".auth")) {
      beforeRedirect?.();
      window.location.href = destination;
      return;
    }

    document.body.classList.add("is-auth-page-leaving-up");

    window.setTimeout(() => {
      beforeRedirect?.();
      window.location.href = destination;
    }, EXIT_DURATION);
  };

  window.crmPageTransition = { transitionTo };
})();