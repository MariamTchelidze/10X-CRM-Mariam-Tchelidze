"use strict";

/* --- Google Auth Placeholder --- */
(function initGoogleAuthPlaceholder() {
  const googleAuthButtons = document.querySelectorAll(".js-google-auth");
  const message = "Google authorization is UI ready and will be integrated later.";

  if (!googleAuthButtons.length) return;

  googleAuthButtons.forEach((button) => {
    button.addEventListener("click", () => {
      window.crmToast?.show(message, "info");
    });
  });
})();
