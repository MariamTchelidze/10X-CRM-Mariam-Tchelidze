"use strict";
const forgotPasswordPage = document.querySelector(".forgotPasswordPage");

initForgotPassword();

function initForgotPassword() {
  if (!forgotPasswordPage) return;

  (function initForgotPasswordForm() {
    const form = document.querySelector(".js-forgot-password-form");

    if (!form) return;

    const emailInput = form.querySelector(".js-forgot-email");
    const submitButton = form.querySelector(".js-forgot-password-submit");
    const statusMessage = form.querySelector(".js-forgot-password-status");
    const emailError = document.querySelector("[data-error-for='forgot-email']");

    const setEmailError = (message) => {
      if (!emailError || !emailInput) return;

      emailError.textContent = message;
      emailError.hidden = !message;
      emailInput.classList.toggle("input--error", Boolean(message));
    };

    const showSuccess = () => {
      if (!statusMessage) return;

      statusMessage.hidden = false;
    };

    const hideSuccess = () => {
      if (!statusMessage) return;

      statusMessage.hidden = true;
    };

    const validateEmail = () => {
      if (!emailInput) return false;

      const email = emailInput.value.trim();

      if (!email) {
        setEmailError("Please enter your email address.");
        return false;
      }

      if (!emailInput.validity.valid) {
        setEmailError("Please enter a valid email address.");
        return false;
      }

      setEmailError("");
      return true;
    };

    emailInput?.addEventListener("input", () => {
      setEmailError("");
      hideSuccess();
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      hideSuccess();

      if (!validateEmail()) return;

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Reset Link Sent";
      }

      showSuccess();

      window.setTimeout(() => {
        if (!submitButton) return;

        submitButton.disabled = false;
        submitButton.textContent = "Send Reset Link";
      }, 1800);
    });
  })();
}
