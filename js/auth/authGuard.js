"use strict";

/* --- Protected Page Authentication Guard --- */
(function initAuthGuard() {
  /* --- Shared modules read saved sessions and page paths. --- */
  const constants = window.crmConstants;
  const storage = window.crmStorage;

  if (!constants || !storage) return;

  /* --- Page markers tell the guard whether this page needs authentication. --- */
  const protectedPage = document.querySelector(".dashboardPage, .clientsPage, .profilePage");
  const publicAuthPage = document.querySelector(".loginPage, .signupPage");
  const session = storage.read(constants.SESSION_KEY, null);
  const hasSession = Boolean(session?.token);

  if (protectedPage && !hasSession) {
    window.location.href = constants.PAGES.login;
    return;
  }

  if (publicAuthPage && hasSession) {
    window.location.href = constants.PAGES.dashboard;
  }
})();
