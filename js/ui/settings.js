"use strict";

/* --- Settings and Account Danger Zone --- */
(function initSettingsPanel() {
  const STORAGE_KEY = "crm_app_settings";
  const SESSION_KEY = "crm_session";
  const DEFAULT_ACCENT = "#ff6b1a";
  const ACCOUNT_STORAGE_KEYS = [
    "crm_users",
    "crm_clients",
    "crm_profile_avatar",
    "crm_tasks",
    "crm_task_notifications",
    "crm_team_chat_history",
    "crm_ai_chat_history",
    "crm_theme",
    STORAGE_KEY,
  ];
  const DEFAULTS = {
    themeMode: "dark",
    customTheme: "dark",
    fontSize: "medium",
    density: "comfortable",
    language: "en",
    accentColor: DEFAULT_ACCENT,
  };

  const form = document.querySelector(".js-settings-form");
  const customThemePanel = document.querySelector(".js-custom-theme-panel");
  const deleteAccountForm = document.querySelector(".js-delete-account-form");

  /* --- Storage helpers keep settings safe even if saved JSON breaks. --- */
  const readSettings = () => {
    try {
      const storedSettings = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const fallbackTheme = document.body.dataset.theme === "light" ? "light" : "dark";
      const themeMode = ["dark", "light", "custom"].includes(storedSettings.themeMode)
        ? storedSettings.themeMode
        : fallbackTheme;
      const customTheme = storedSettings.customTheme === "light" ? "light" : "dark";

      return {
        ...DEFAULTS,
        ...storedSettings,
        themeMode,
        customTheme,
      };
    } catch (error) {
      return { ...DEFAULTS };
    }
  };

  const saveSettings = (settings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      // The UI still updates for this page if storage is unavailable.
    }
  };

  const setChecked = (selector, value) => {
    const input = document.querySelector(`${selector}[value="${value}"]`);

    if (input) {
      input.checked = true;
    }
  };

  /* --- Appearance helpers apply theme, font size, accent, and custom mode. --- */
  const applyAccentColor = (color) => {
    document.body.style.setProperty("--color-primary", color);
  };

  const setTheme = (theme) => {
    const nextTheme = theme === "light" ? "light" : "dark";

    if (window.crmTheme && typeof window.crmTheme.applyTheme === "function") {
      window.crmTheme.applyTheme(nextTheme);
      return;
    }

    document.dispatchEvent(new CustomEvent("crm:theme:set", { detail: { theme: nextTheme } }));
  };

  const syncCustomPanel = (isCustom) => {
    if (!customThemePanel) return;

    customThemePanel.dataset.enabled = String(isCustom);
    customThemePanel.querySelectorAll("input, button").forEach((control) => {
      control.disabled = !isCustom;
    });
  };

  const applySettings = (settings) => {
    const isCustom = settings.themeMode === "custom";
    const activeAccent = isCustom ? settings.accentColor : DEFAULT_ACCENT;

    document.documentElement.dataset.fontSize = settings.fontSize;
    document.body.dataset.density = settings.density;
    document.documentElement.lang = settings.language;
    applyAccentColor(activeAccent);

    setChecked(".js-settings-theme", settings.themeMode);
    setChecked(".js-settings-font", settings.fontSize);
    setChecked(".js-settings-density", settings.density);
    setChecked(".js-settings-language", settings.language);
    syncCustomPanel(isCustom);

    const accentInput = document.querySelector(".js-settings-accent");

    if (accentInput) {
      accentInput.value = settings.accentColor;
    }
  };

  /* --- Account deletion helpers verify the current password before clearing data. --- */
  const getStoredAccountPassword = () => {
    try {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY) || "{}");
      const users = JSON.parse(localStorage.getItem("crm_users") || "[]");
      const currentUser = Array.isArray(users)
        ? users.find((user) => user.email && user.email === session.email) || users[0]
        : null;

      return currentUser?.password || session.password || "10xcrm";
    } catch (error) {
      return "10xcrm";
    }
  };

  const setDeleteAccountError = (message) => {
    const error = deleteAccountForm?.querySelector(".js-delete-account-error");

    if (!error) return;

    error.textContent = message;
    error.hidden = !message;
  };

  const clearAccountData = () => {
    try {
      ACCOUNT_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
      localStorage.removeItem(SESSION_KEY);
    } catch (error) {
      // Redirect still happens if storage is partially unavailable.
    }

    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      // Some browsers can block session storage in private modes.
    }
  };

  /* --- Runtime settings state starts from localStorage and updates through the form. --- */
  let settings = readSettings();
  applySettings(settings);
  setTheme(settings.themeMode === "custom" ? settings.customTheme : settings.themeMode);

  window.addEventListener("crm:themechange", (event) => {
    const changedTheme = event.detail && event.detail.theme === "light" ? "light" : "dark";

    if (settings.themeMode === "custom" && settings.customTheme === changedTheme) return;
    if (settings.themeMode === changedTheme) return;

    settings = {
      ...settings,
      themeMode: changedTheme,
      customTheme: settings.customTheme,
      accentColor: DEFAULT_ACCENT,
    };
    applySettings(settings);
    saveSettings(settings);
  });

  form?.addEventListener("change", (event) => {
    const target = event.target;

    if (target.matches(".js-settings-theme")) {
      if (target.value === "custom") {
        settings = {
          ...settings,
          themeMode: "custom",
          customTheme: document.body.dataset.theme === "light" ? "light" : "dark",
        };
        applySettings(settings);
        saveSettings(settings);
        document.querySelector(".js-settings-accent")?.focus({ preventScroll: true });
        return;
      }

      settings = {
        ...settings,
        themeMode: target.value,
        accentColor: DEFAULT_ACCENT,
      };
      setTheme(target.value);
      applySettings(settings);
      saveSettings(settings);
      return;
    }

    if (target.matches(".js-settings-font")) {
      settings = { ...settings, fontSize: target.value };
    }

    if (target.matches(".js-settings-density")) {
      settings = { ...settings, density: target.value };
    }

    if (target.matches(".js-settings-language")) {
      settings = { ...settings, language: target.value };
      window.crmI18n?.setLanguage(settings.language);
    }

    if (target.matches(".js-settings-accent")) {
      if (settings.themeMode !== "custom") return;

      settings = { ...settings, accentColor: target.value };
    }

    applySettings(settings);
    saveSettings(settings);
  });

  document.addEventListener("click", (event) => {
    const swatch = event.target.closest("[data-accent-color]");

    if (!swatch || settings.themeMode !== "custom") return;

    settings = { ...settings, accentColor: swatch.dataset.accentColor || DEFAULT_ACCENT };
    applySettings(settings);
    saveSettings(settings);
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(".js-delete-account-trigger");

    if (!trigger || !deleteAccountForm) return;

    deleteAccountForm.reset();
    setDeleteAccountError("");
  });

  deleteAccountForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const password = deleteAccountForm.querySelector(".js-delete-account-password")?.value.trim();
    const storedPassword = getStoredAccountPassword();

    if (!password) {
      setDeleteAccountError("Please enter your password.");
      return;
    }

    if (password !== storedPassword) {
      setDeleteAccountError("Password does not match this account.");
      return;
    }

    clearAccountData();
    window.location.href = "./index.html";
  });
})();
