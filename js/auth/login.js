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
  const data = window.crmData;
  const form = document.querySelector(".js-login-form");

  if (!constants || !storage || !validation || !data || !form) return;

  /* --- Login inputs are collected once so validation and submit logic can reuse them. --- */
  const emailInput = form.querySelector("#login-email");
  const passwordInput = form.querySelector("#login-password");

  const setSubmitLoading = (isLoading) => {
    const submitButton = form.querySelector("[type='submit']");
    if (!submitButton) return;

    if (isLoading) {
      if (!submitButton.dataset.originalText) submitButton.dataset.originalText = submitButton.textContent;
      submitButton.textContent = "Signing in...";
      submitButton.disabled = true;
      return;
    }

    submitButton.textContent = submitButton.dataset.originalText || "Sign In";
    submitButton.disabled = false;
    delete submitButton.dataset.originalText;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    validation.clearFormErrors(form);

    /* --- Submitted values are normalized before comparing with saved users. --- */
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
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

    try {
      setSubmitLoading(true);

      /* --- Backend login creates a JWT session for protected API requests. --- */
      const result = await data.authRequest("/auth/login", { email, password });
      const user = result.user;
      const users = storage.read(constants.USERS_KEY, []);
      const nextUser = {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        company: user.company,
        role: user.role,
        bio: user.bio,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
      const remainingUsers = users.filter((item) => item.email?.toLowerCase() !== user.email.toLowerCase());

      storage.write(constants.USERS_KEY, [...remainingUsers, nextUser]);
      storage.write(constants.SESSION_KEY, {
        token: result.token,
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        company: user.company,
        role: user.role,
        loginAt: new Date().toISOString(),
      });

      window.crmToast?.queue("You have been logged in successfully.", "success");

      if (window.crmPageTransition) {
        window.crmPageTransition.transitionTo(constants.PAGES.dashboard);
        return;
      }

      window.location.href = constants.PAGES.dashboard;
    } catch (error) {
      validation.setFieldError(passwordInput, error.message || "Invalid email or password");
    } finally {
      setSubmitLoading(false);
    }
  });
}
