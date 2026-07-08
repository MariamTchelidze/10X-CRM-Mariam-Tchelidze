"use strict";

(function initLogout() {
  const SESSION_KEY = "crm_session";
  const loginPage = "./index.html";
  const logoutButtons = document.querySelectorAll(".js-logout-btn, #logout-btn");

  if (!logoutButtons.length) return;

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
      clearSession();
      button.disabled = true;
      window.location.href = loginPage;
    });
  });
})();