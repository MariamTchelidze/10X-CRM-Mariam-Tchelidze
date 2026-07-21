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
  const data = window.crmData;
  const form = document.querySelector(".js-signup-form");

  /* --- Stop early if a required module or form is missing on this page. --- */
  if (!constants || !storage || !validation || !data || !form) return;

  /* --- Form fields are collected once for validation and account creation. --- */
  const fullNameInput = form.querySelector("#signup-full-name");
  const companyInput = form.querySelector("#signup-company");
  const emailInput = form.querySelector("#signup-email");
  const passwordInput = form.querySelector("#signup-password");
  const confirmPasswordInput = form.querySelector("#signup-confirm-password");

  const setSubmitLoading = (isLoading) => {
    const submitButton = form.querySelector("[type='submit']");
    if (!submitButton) return;

    if (isLoading) {
      if (!submitButton.dataset.originalText) submitButton.dataset.originalText = submitButton.textContent;
      submitButton.textContent = "Creating account...";
      submitButton.disabled = true;
      return;
    }

    submitButton.textContent = submitButton.dataset.originalText || "Sign Up";
    submitButton.disabled = false;
    delete submitButton.dataset.originalText;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    validation.clearFormErrors(form);

    /* --- Submitted values are cleaned before validation and storage. --- */
    const fullName = fullNameInput.value.trim();
    const company = companyInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    let isValid = true;

    if (fullName.length < 3) {
      validation.setFieldError(fullNameInput, "Full name must be at least 3 characters");
      isValid = false;
    }

    if (!validation.emailIsValid(email)) {
      validation.setFieldError(emailInput, "Please enter a valid email address");
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

    try {
      setSubmitLoading(true);

      /* --- Backend signup stores the secure account in MongoDB, never localStorage password. --- */
      const result = await data.authRequest("/auth/signup", {
        fullName,
        company,
        email,
        password,
        confirmPassword,
      });
      const users = storage.read(constants.USERS_KEY, []);
      const user = result.user;
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
      window.crmToast?.show("Account created successfully! Please log in.", "success");

      window.setTimeout(() => {
        window.location.href = constants.PAGES.login;
      }, 900);
    } catch (error) {
      validation.setFieldError(emailInput, error.message || "Account could not be created");
    } finally {
      setSubmitLoading(false);
    }
  });
}
