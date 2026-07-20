"use strict";

/* --- Auth Page Soft Navigation --- */
(function initAuthPageSwap() {
  /* --- Short timing keeps auth links responsive while still feeling polished. --- */
  const EXIT_DURATION = 180;
  const links = document.querySelectorAll(".js-auth-link[data-auth-target]");
  const authPage = document.querySelector(".auth[data-auth-page]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!authPage || !links.length) return;

  document.body.classList.add("is-auth-page-ready");

  /* --- Auth links use a quick fade before normal page navigation. --- */
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const destination = link.href;

      if (!destination) return;

      event.preventDefault();

      if (prefersReducedMotion) {
        window.location.href = destination;
        return;
      }

      document.body.classList.add("is-auth-page-exiting");

      window.setTimeout(() => {
        window.location.href = destination;
      }, EXIT_DURATION);
    });
  });
})();
