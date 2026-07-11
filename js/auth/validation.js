"use strict";

(function initValidationHelpers() {
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

  const passwordIsValid = (password) => {
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
  };

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
