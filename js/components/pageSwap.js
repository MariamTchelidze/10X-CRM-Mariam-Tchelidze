"use strict";

/* --- Auth Page Swap Animation --- */
(function initAuthPageSwap() {
  /* --- Animation constants coordinate auth-page slide direction and timing. --- */
  const ENTER_KEY = "crm_auth_page_enter_from";
  const EXIT_DURATION = 560;
  const ENTER_DURATION = 580;
  const links = document.querySelectorAll(".js-auth-link[data-auth-target]");
  const authPage = document.querySelector(".auth[data-auth-page]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!authPage) return;

  /* --- Clears stored animation direction after the incoming page reads it. --- */
  const clearEnterState = () => {
    document.body.classList.remove("is-auth-page-entering-from-right", "is-auth-page-enter-ready");
  };

  /* --- Plays the slide-in effect when moving between auth pages. --- */
  const playEnter = () => {
    const enterFrom = sessionStorage.getItem(ENTER_KEY);
    sessionStorage.removeItem(ENTER_KEY);

    if (prefersReducedMotion || enterFrom !== "right") return;

    document.body.classList.add("is-auth-page-entering-from-right");

    window.requestAnimationFrame(() => {
      document.body.classList.add("is-auth-page-enter-ready");
      window.setTimeout(clearEnterState, ENTER_DURATION);
    });
  };

  playEnter();

  if (!links.length) return;

  /* --- Auth links save the target direction before changing HTML pages. --- */
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

      document.body.classList.add("is-auth-page-exiting-left");
      sessionStorage.setItem(ENTER_KEY, "right");

      window.setTimeout(() => {
        window.location.href = destination;
      }, EXIT_DURATION);
    });
  });
})();
