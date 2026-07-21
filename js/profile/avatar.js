"use strict";

/* --- Profile Avatar Prepared UI --- */
(function initProfileAvatar() {
  /* --- Avatar upload is UI-only because real files need backend/cloud storage. --- */
  const input = document.querySelector(".js-profile-avatar-input");
  const image = document.querySelector(".js-profile-avatar-image");
  const initials = document.querySelector(".js-profile-avatar-initials");
  const removeButton = document.querySelector(".js-remove-avatar");
  const message = document.querySelector(".js-profile-avatar-message");
  const FUTURE_UPLOAD_MESSAGE = "Profile image upload is prepared for future file storage integration.";
  const FUTURE_REMOVE_MESSAGE = "Profile image removal is prepared for future file storage integration.";
  let messageTimerId = null;

  if (!input || !image || !initials) return;

  /* --- Message helpers keep the profile card feedback short and readable. --- */
  const setMessage = (text) => {
    if (!message) return;

    if (messageTimerId) {
      window.clearTimeout(messageTimerId);
    }

    message.textContent = text;
    message.dataset.type = "info";
    message.dataset.visible = "true";
    window.crmToast?.show(text, "info");

    messageTimerId = window.setTimeout(() => {
      message.dataset.visible = "false";
      messageTimerId = null;
    }, 2800);
  };

  const keepInitialsAvatar = () => {
    image.hidden = true;
    image.removeAttribute("src");
    initials.hidden = false;
  };

  input.addEventListener("change", () => {
    input.value = "";
    keepInitialsAvatar();
    setMessage(FUTURE_UPLOAD_MESSAGE);
  });

  removeButton?.addEventListener("click", () => {
    input.value = "";
    keepInitialsAvatar();
    setMessage(FUTURE_REMOVE_MESSAGE);
  });

  keepInitialsAvatar();
})();
