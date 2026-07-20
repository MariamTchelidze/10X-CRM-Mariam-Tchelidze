"use strict";

/* --- Profile Page Controller --- */
const profilePage = document.querySelector(".profilePage");

initProfile();

function initProfile() {
  if (!profilePage) return;

  /* --- Shared modules connect profile to auth users, clients, validation, and API reset. --- */
  const constants = window.crmConstants;
  const storage = window.crmStorage;
  const validation = window.crmValidation;
  const data = window.crmData;
  const profileForm = document.querySelector(".js-profile-form");
  const passwordForm = document.querySelector(".js-password-form");
  const resetButton = document.querySelector(".js-confirm-reset");
  const callNoteDeleteModal = document.querySelector(".js-call-note-delete-modal");
  const callNoteDeleteConfirm = document.querySelector(".js-confirm-call-note-delete");
  const callNoteDeleteCancelButtons = document.querySelectorAll(".js-cancel-call-note-delete");
  let pendingCallNoteId = null;

  if (!constants || !storage || !validation || !passwordForm) return;

  /* --- Form references collect editable profile and password fields. --- */
  const profileNameInput = profileForm?.querySelector("#profile-name");
  const profileEmailInput = profileForm?.querySelector("#profile-email");
  const profileCompanyInput = profileForm?.querySelector("#profile-company");
  const profileRoleInput = profileForm?.querySelector("#profile-role");
  const profileBioInput = profileForm?.querySelector("#profile-bio");
  const profileInitials = document.querySelector(".js-profile-avatar-initials");
  const memberSinceElement = document.querySelector(".js-profile-member-since");
  const currentPasswordInput = passwordForm.querySelector("#current-password");
  const newPasswordInput = passwordForm.querySelector("#new-password");
  const confirmPasswordInput = passwordForm.querySelector("#confirm-new-password");

  /* --- Account helpers read the active session and matching stored user. --- */
  const getUsers = () => storage.read(constants.USERS_KEY, []);

  const getSession = () => storage.read(constants.SESSION_KEY, null);

  /* --- Current User Helpers --- */
  const getCurrentUser = () => {
    const session = getSession();
    const users = getUsers();

    if (!session) return null;

    return users.find((user) => user.id === session.userId || user.email === session.email) || null;
  };

  /* --- Display helpers format profile initials, dates, and safe HTML. --- */
  const getInitials = (name = "") => {
    if (data?.getInitials) return data.getInitials(name);

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  };

  const formatDate = (value) => {
    if (!value) return "Unknown";

    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const escapeHtml = (value) =>
    String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  /* --- Dynamic Call History Rendering --- */
  const renderCallHistory = () => {
    const container = document.querySelector(".js-profile-call-history");
    if (!container) return;

    const notes = storage.read("crm_call_notes", []);

    if (!notes.length) {
      container.innerHTML = '<p class="profile-call-history__empty">No call notes saved yet.</p>';
      return;
    }

    container.innerHTML = notes
      .slice(0, 6)
      .map(
        (item) => `
          <article class="profile-call-history__item">
            <div class="profile-call-history__meta">
              <div>
                <strong>${escapeHtml(item.clientName || "Manual number")}</strong>
                <span>${escapeHtml(item.company || item.phone || "No phone saved")}</span>
              </div>
              <button
                class="icon-btn icon-btn--danger profile-call-history__delete js-delete-call-note"
                type="button"
                data-note-id="${escapeHtml(item.id)}"
                data-skip-delete-confirm
                aria-label="Delete call note"
              >
                <img
                  src="./assets/icons/Delete.svg"
                  data-theme-src-dark="./assets/icons/Delete.svg"
                  data-theme-src-light="./assets/icons/Delete-light-theme.svg"
                  alt=""
                />
              </button>
            </div>
            <p>${escapeHtml(item.note)}</p>
            <time>${formatDate(item.createdAt)}</time>
          </article>
        `,
      )
      .join("");
  };

  /* --- Statistics helper derives private profile KPIs from CRM clients. --- */
  const updateProfileStats = () => {
    const clients = storage.read(constants.CLIENTS_KEY, []);
    const leads = clients.filter((client) => client.status === "lead").length;
    const successful = clients.filter((client) => client.status === "won").length;
    const failed = clients.filter((client) => client.status === "lost").length;
    const totalClosed = successful + failed;
    const kpi = totalClosed ? Math.round((successful / totalClosed) * 100) : 0;

    document.querySelector('[data-profile-stat="leads"]')?.replaceChildren(String(leads));
    document.querySelector('[data-profile-stat="successful"]')?.replaceChildren(String(successful));
    document.querySelector('[data-profile-stat="failed"]')?.replaceChildren(String(failed));
    document.querySelector('[data-profile-stat="kpi"]')?.replaceChildren(String(kpi));
  };

  /* --- Profile Rendering --- */
  const renderProfile = () => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      storage.remove(constants.SESSION_KEY);
      window.location.href = constants.PAGES.login;
      return;
    }

    if (profileNameInput) profileNameInput.value = currentUser.fullName || "";
    if (profileEmailInput) profileEmailInput.value = currentUser.email || "";
    if (profileCompanyInput) profileCompanyInput.value = currentUser.company || "";
    if (profileRoleInput) profileRoleInput.value = currentUser.role || "";
    if (profileBioInput) profileBioInput.value = currentUser.bio || "";
    if (profileInitials) profileInitials.textContent = getInitials(currentUser.fullName || currentUser.email);

    if (memberSinceElement) memberSinceElement.textContent = formatDate(currentUser.createdAt);
    updateProfileStats();
    renderCallHistory();
  };

  window.addEventListener("crm:call-note-saved", renderCallHistory);

  /* --- Call-note delete helpers manage one focused confirmation modal. --- */
  const openCallNoteDeleteModal = (noteId) => {
    pendingCallNoteId = noteId;
    callNoteDeleteModal.hidden = false;
    callNoteDeleteModal.dataset.modalState = "open";
    callNoteDeleteModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    window.requestAnimationFrame(() => callNoteDeleteConfirm?.focus({ preventScroll: true }));
  };

  const closeCallNoteDeleteModal = () => {
    if (!callNoteDeleteModal) return;

    pendingCallNoteId = null;
    callNoteDeleteModal.hidden = true;
    callNoteDeleteModal.dataset.modalState = "closed";
    callNoteDeleteModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  document.querySelector(".js-profile-call-history")?.addEventListener("click", (event) => {
    const deleteButton = event.target.closest(".js-delete-call-note");
    if (!deleteButton) return;

    openCallNoteDeleteModal(deleteButton.dataset.noteId);
  });

  callNoteDeleteConfirm?.addEventListener("click", () => {
    if (!pendingCallNoteId) return;

    const notes = storage.read("crm_call_notes", []);
    storage.write(
      "crm_call_notes",
      notes.filter((note) => note.id !== pendingCallNoteId),
    );
    closeCallNoteDeleteModal();
    renderCallHistory();
    window.crmToast?.show("Call note deleted", "success");
  });

  callNoteDeleteCancelButtons.forEach((button) => button.addEventListener("click", closeCallNoteDeleteModal));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && callNoteDeleteModal && !callNoteDeleteModal.hidden) {
      event.preventDefault();
      closeCallNoteDeleteModal();
    }
  });

  profileForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    validation.clearFormErrors(profileForm);

    const currentUser = getCurrentUser();
    const users = getUsers();
    const fullName = profileNameInput?.value.trim() || "";
    const company = profileCompanyInput?.value.trim() || "";
    const role = profileRoleInput?.value.trim() || "";
    const bio = profileBioInput?.value.trim() || "";

    if (!currentUser) return;

    if (fullName.length < 3) {
      validation.setFieldError(profileNameInput, "Full name must be at least 3 characters");
      return;
    }

    const updatedUsers = users.map((user) =>
      user.id === currentUser.id
        ? {
            ...user,
            fullName,
            company,
            role,
            bio,
          }
        : user,
    );

    storage.write(constants.USERS_KEY, updatedUsers);
    renderProfile();
    window.crmToast?.show("Profile updated", "success");
  });

  passwordForm.addEventListener("submit", (event) => {
    event.preventDefault();

    validation.clearFormErrors(passwordForm);

    const currentUser = getCurrentUser();
    const users = getUsers();
    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    let isValid = true;

    if (!currentUser || currentPassword !== currentUser.password) {
      validation.setFieldError(currentPasswordInput, "Current password is incorrect");
      isValid = false;
    }

    if (!validation.passwordIsValid(newPassword)) {
      validation.setFieldError(
        newPasswordInput,
        "Password must be at least 8 characters and contain a Latin letter and a number",
      );
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
    window.crmToast?.show("Password changed. Please log in again.", "success");

    window.setTimeout(() => {
      window.location.href = constants.PAGES.login;
    }, 1200);
  });

  resetButton?.addEventListener("click", async () => {
    if (!data?.fetchInitialClients) return;

    resetButton.disabled = true;
    resetButton.textContent = "Resetting...";

    try {
      storage.remove(constants.CLIENTS_KEY);
      const clients = await data.fetchInitialClients();
      storage.write(constants.CLIENTS_KEY, clients);
      updateProfileStats();
      window.crmToast?.show("Client data reset from API.", "success");
      document.querySelector("#reset-data-modal [data-modal-close]")?.click();
    } catch (error) {
      window.crmToast?.show("Could not reset clients. Check your connection and try again.", "error");
    } finally {
      resetButton.disabled = false;
      resetButton.textContent = "Reset Data";
    }
  });

  renderProfile();
}
