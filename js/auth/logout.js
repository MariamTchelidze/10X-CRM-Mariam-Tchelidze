"use strict";

/* --- Logout Flow --- */
(function initLogout() {
  /* --- Logout only needs the session key and login destination. --- */
  const SESSION_KEY = "crm_session";
  const loginPage = "./index.html";
  const logoutButtons = document.querySelectorAll(".js-logout-btn, #logout-btn");

  if (!logoutButtons.length) return;

  /* --- Removes the active login session from localStorage. --- */
  const clearSession = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      // If storage is blocked, still redirect the user to the sign-in page.
    }
  };

  logoutButtons.forEach((button) => {
    button.addEventListener("click", () => {
      button.disabled = true;
      clearSession();
      window.location.href = loginPage; // page where we are addressed after log out
    });
  });
})();
