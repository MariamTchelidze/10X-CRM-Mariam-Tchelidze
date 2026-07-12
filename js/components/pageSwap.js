"use strict";

(function initAuthPageSwap() {
  const links = document.querySelectorAll(".js-auth-link[data-auth-target]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!links.length) return;

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = link.dataset.authTarget;
      const destination = link.href;

      if (!target || prefersReducedMotion) return;

      event.preventDefault();

      document.body.classList.add("is-auth-swapping", `is-swapping-to-${target}`);

      window.setTimeout(() => {
        window.location.href = destination;
      }, 300);
    });
  });
})();
