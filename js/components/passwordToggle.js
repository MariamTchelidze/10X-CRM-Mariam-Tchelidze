"use strict";

(function initPasswordToggles() {
  const getCurrentTheme = () => document.body.dataset.theme === "light" ? "light" : "dark";

  const getIconPath = (isVisible) => {
    const state = isVisible ? "open" : "closed";
    const suffix = getCurrentTheme() === "light" ? "-light-theme" : "";

    return `./assets/icons/eye-${state}${suffix}.svg`;
  };

  const updateToggleIcon = (toggle, input) => {
    const icon = toggle.querySelector(".password-field__icon");
    const isVisible = input.type === "text";

    if (icon) {
      icon.src = getIconPath(isVisible);
    }

    toggle.setAttribute("aria-label", isVisible ? "Hide password" : "Show password");
  };

  const setupToggle = (toggle) => {
    const field = toggle.closest(".password-field");
    const input = field ? field.querySelector("input") : null;

    if (!input) return;

    updateToggleIcon(toggle, input);

    toggle.addEventListener("click", () => {
      input.type = input.type === "password" ? "text" : "password";
      updateToggleIcon(toggle, input);
    });
  };

  const refreshIcons = () => {
    document.querySelectorAll(".js-password-toggle").forEach((toggle) => {
      const field = toggle.closest(".password-field");
      const input = field ? field.querySelector("input") : null;

      if (input) {
        updateToggleIcon(toggle, input);
      }
    });
  };

  document.querySelectorAll(".js-password-toggle").forEach(setupToggle);
  window.addEventListener("crm:themechange", refreshIcons);
})();