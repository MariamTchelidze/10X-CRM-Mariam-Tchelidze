"use strict";

/* --- Login Form Logic --- */
const loginPage = document.querySelector(".loginPage");

initLogin();

function initLogin() {
  if (!loginPage) return;

  /* --- Shared modules handle storage, routes, and validation helpers. --- */
  const constants = window.crmConstants;
  const storage = window.crmStorage;
  const validation = window.crmValidation;
  const form = document.querySelector(".js-login-form");

  if (!constants || !storage || !validation || !form) return;

  /* --- Login inputs are collected once so validation and submit logic can reuse them. --- */
  const emailInput = form.querySelector("#login-email");
  const passwordInput = form.querySelector("#login-password");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    validation.clearFormErrors(form);

    /* --- Submitted values are normalized before comparing with saved users. --- */
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const users = storage.read(constants.USERS_KEY, []);
    let isValid = true;

    if (!email) {
      validation.setFieldError(emailInput, "Email is required");
      isValid = false;
    }

    if (!password) {
      validation.setFieldError(passwordInput, "Password is required");
      isValid = false;
    }

    if (!isValid) return;

    /* --- A matching user creates the browser session for protected pages. --- */
    const user = users.find((item) => item.email.toLowerCase() === email && item.password === password);

    if (!user) {
      validation.setFieldError(passwordInput, "Invalid email or password");
      return;
    }
    /* ---  Session creation --- */
    storage.write(constants.SESSION_KEY, {
      userId: user.id,
      email: user.email,
      loginAt: new Date().toISOString(),
    });

    window.crmToast?.queue("You have been logged in successfully.", "success");

    if (window.crmPageTransition) {
      window.crmPageTransition.transitionTo(constants.PAGES.dashboard);
      return;
    }

    window.location.href = constants.PAGES.dashboard;
  });
}
