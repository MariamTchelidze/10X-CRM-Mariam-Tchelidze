"use strict";

/* --- Sign Up Form Logic --- */
const signupPage = document.querySelector(".signupPage");

initSignup();

function initSignup() {
  if (!signupPage) return;

  /* --- Shared modules keep auth storage and validation consistent. --- */
  const constants = window.crmConstants;
  const storage = window.crmStorage;
  const validation = window.crmValidation;
  const form = document.querySelector(".js-signup-form");

  /* --- Stop early if a required module or form is missing on this page. --- */
  if (!constants || !storage || !validation || !form) return;

  /* --- Form fields are collected once for validation and account creation. --- */
  const fullNameInput = form.querySelector("#signup-full-name");
  const companyInput = form.querySelector("#signup-company");
  const emailInput = form.querySelector("#signup-email");
  const passwordInput = form.querySelector("#signup-password");
  const confirmPasswordInput = form.querySelector("#signup-confirm-password");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    validation.clearFormErrors(form);

    /* --- Submitted values are cleaned before validation and storage. --- */
    const fullName = fullNameInput.value.trim();
    const company = companyInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const users = storage.read(constants.USERS_KEY, []);
    let isValid = true;

    if (fullName.length < 3) {
      validation.setFieldError(fullNameInput, "Full name must be at least 3 characters");
      isValid = false;
    }

    if (!validation.emailIsValid(email)) {
      validation.setFieldError(emailInput, "Please enter a valid email address");
      isValid = false;
    } else if (users.some((user) => user.email.toLowerCase() === email)) {
      validation.setFieldError(emailInput, "An account with this email already exists");
      isValid = false;
    }

    if (!validation.passwordIsValid(password)) {
      validation.setFieldError(
        passwordInput,
        "Password must be at least 8 characters and contain a Latin letter and a number",
      );
      isValid = false;
    }

    if (confirmPassword !== password) {
      validation.setFieldError(confirmPasswordInput, "Passwords do not match");
      isValid = false;
    }

    if (!isValid) return;

    /* --- Demo user object saved in crm_users for the login flow. --- */
    const user = {
      id: Date.now(),
      fullName,
      email,
      password,
      company,
      createdAt: new Date().toISOString(),
    };

    storage.write(constants.USERS_KEY, [...users, user]);
    window.crmToast?.show("Account created successfully! Please log in.", "success");

    window.setTimeout(() => {
      window.location.href = constants.PAGES.login;
    }, 900);
  });
}
