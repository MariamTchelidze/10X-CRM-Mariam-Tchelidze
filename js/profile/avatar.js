"use strict";

(function initProfileAvatar() {
  const AVATAR_KEY = "crm_profile_avatar";
  const MAX_FILE_SIZE = 1024 * 1024;

  const input = document.querySelector(".js-profile-avatar-input");
  const image = document.querySelector(".js-profile-avatar-image");
  const initials = document.querySelector(".js-profile-avatar-initials");
  const removeButton = document.querySelector(".js-remove-avatar");
  const message = document.querySelector(".js-profile-avatar-message");
  let messageTimerId = null;

  if (!input || !image || !initials) return;

  const clearMessageTimer = () => {
    if (!messageTimerId) return;

    window.clearTimeout(messageTimerId);
    messageTimerId = null;
  };

  const setMessage = (text, type = "info") => {
    if (!message) return;

    clearMessageTimer();
    message.textContent = text;
    message.dataset.type = type;
    message.dataset.visible = text ? "true" : "false";

    if (!text) return;

    messageTimerId = window.setTimeout(() => {
      message.dataset.visible = "false";
      messageTimerId = null;
    }, type === "error" ? 4200 : 2400);
  };

  const saveAvatar = (src) => {
    try {
      localStorage.setItem(AVATAR_KEY, src);
    } catch (error) {
      setMessage("Image preview is visible now, but it could not be saved for reload.", "error");
    }
  };

  const removeSavedAvatar = () => {
    try {
      localStorage.removeItem(AVATAR_KEY);
    } catch (error) {
      // Nothing else is needed if storage is unavailable.
    }
  };

  const showAvatar = (src) => {
    if (!src) {
      image.hidden = true;
      image.removeAttribute("src");
      initials.hidden = false;
      return;
    }

    image.src = src;
    image.hidden = false;
    initials.hidden = true;
  };

  const getSavedAvatar = () => {
    try {
      return localStorage.getItem(AVATAR_KEY);
    } catch (error) {
      return null;
    }
  };

  const handleAvatarChange = () => {
    const file = input.files && input.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.", "error");
      input.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage("Please choose an image smaller than 1 MB.", "error");
      input.value = "";
      return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      const avatarSrc = String(reader.result || "");

      showAvatar(avatarSrc);
      saveAvatar(avatarSrc);
      setMessage("Profile image updated.", "success");
    });

    reader.addEventListener("error", () => {
      setMessage("Image could not be loaded. Please try another file.", "error");
    });

    reader.readAsDataURL(file);
  };

  input.addEventListener("change", handleAvatarChange);

  if (removeButton) {
    removeButton.addEventListener("click", () => {
      input.value = "";
      showAvatar("");
      removeSavedAvatar();
      setMessage("Profile image removed.", "info");
    });
  }

  showAvatar(getSavedAvatar());
})();