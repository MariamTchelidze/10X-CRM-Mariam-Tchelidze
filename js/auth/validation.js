"use strict";

/* --- Shared Authentication Validation Rules --- */
(function initValidationHelpers() {
  /* --- Email must have an allowed demo domain and a valid local/domain shape. --- */
  const emailIsValid = (email) => {
    const allowedDomains = [".com", ".net", ".org"];
    const normalized = email.trim().toLowerCase();
    const atIndex = normalized.indexOf("@");
    const dotIndex = normalized.lastIndexOf(".");
    const domainEnding = normalized.slice(dotIndex);

    return (
      atIndex > 0 &&
      dotIndex > atIndex + 1 &&
      allowedDomains.includes(domainEnding) &&
      normalized.endsWith(domainEnding)
    );
  };

  /* --- Passwords are limited to Latin letters, numbers, and safe symbols. --- */
  const passwordIsValid = (password) => {
    const allowedCharacters = /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/;

    return (
      password.length >= 8 &&
      allowedCharacters.test(password) &&
      /[A-Za-z]/.test(password) &&
      /[0-9]/.test(password)
    );
  };

  /* --- Field errors are rendered near their matching input. --- */
  const getErrorElement = (input) => {
    return document.querySelector(`[data-error-for="${input.id}"]`);
  };

  const setFieldError = (input, message = "") => {
    const error = getErrorElement(input);
    input.classList.toggle("input-error", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");

    if (!error) return;

    error.textContent = message;
    error.hidden = !message;
  };

  const clearFormErrors = (form) => {
    form.querySelectorAll(".input, .select-field, textarea").forEach((input) => setFieldError(input));
  };

  window.crmValidation = {
    emailIsValid,
    passwordIsValid,
    setFieldError,
    clearFormErrors,
  };
})();
