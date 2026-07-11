"use strict";

const profilePage = document.querySelector(".profilePage");

initProfile();

function initProfile() {
  if (!profilePage) return;

  const constants = window.crmConstants;
  const storage = window.crmStorage;
  const validation = window.crmValidation;
  const passwordForm = document.querySelector(".js-password-form");

  if (!constants || !storage || !validation || !passwordForm) return;

  const currentPasswordInput = passwordForm.querySelector("#current-password");
  const newPasswordInput = passwordForm.querySelector("#new-password");
  const confirmPasswordInput = passwordForm.querySelector("#confirm-new-password");

  const getCurrentUser = () => {
    const session = storage.read(constants.SESSION_KEY, null);
    const users = storage.read(constants.USERS_KEY, []);

    if (!session) return null;

    return users.find((user) => user.id === session.userId || user.email === session.email) || null;
  };

  passwordForm.addEventListener("submit", (event) => {
    event.preventDefault();

    validation.clearFormErrors(passwordForm);

    const currentUser = getCurrentUser();
    const users = storage.read(constants.USERS_KEY, []);
    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    let isValid = true;

    if (!currentUser || currentPassword !== currentUser.password) {
      validation.setFieldError(currentPasswordInput, "Current password is incorrect");
      isValid = false;
    }

    if (!validation.passwordIsValid(newPassword)) {
      validation.setFieldError(newPasswordInput, "Password must be at least 8 characters and contain a letter and a number");
      isValid = false;
    } else if (newPassword === currentPassword) {
      validation.setFieldError(newPasswordInput, "New password must be different from the current one");
      isValid = false;
    }

    if (confirmPassword !== newPassword) {
      validation.setFieldError(confirmPasswordInput, "Passwords do not match");
      isValid = false;
    }

    if (!isValid) return;

    const updatedUsers = users.map((user) =>
      user.id === currentUser.id ? { ...user, password: newPassword } : user,
    );

    storage.write(constants.USERS_KEY, updatedUsers);
    storage.remove(constants.SESSION_KEY);
    passwordForm.reset();
    window.crmToast?.show("Password changed âœ“ Please log in again.", "success");

    window.setTimeout(() => {
      window.location.href = constants.PAGES.login;
    }, 1200);
  });
}
