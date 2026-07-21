"use strict";

/* --- Settings and Account Danger Zone --- */
(function initSettingsPanel() {
  const STORAGE_KEY = "crm_app_settings";
  const SESSION_KEY = "crm_session";
  const data = window.crmData;
  const DEFAULT_ACCENT = "#ff6b1a";
  const FUTURE_SETTINGS_MESSAGE = "This setting is prepared for future integration.";
  const ACCOUNT_STORAGE_KEYS = [
    "crm_users",
    "crm_team_members",
    "crm_team_roles",
    "crm_clients",
    "crm_files",
    "crm_activity",
    "crm_profile_avatar",
    "crm_tasks",
    "crm_task_notifications",
    "crm_team_chat_history",
    "crm_ai_chat_history",
    "crm_sensai_chat_history",
    "crm_sales_settings",
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
      const themeMode = ["dark", "light"].includes(storedSettings.themeMode)
        ? storedSettings.themeMode
        : fallbackTheme;

      return {
        ...DEFAULTS,
        ...storedSettings,
        themeMode,
        customTheme: "dark",
        fontSize: "medium",
        density: "comfortable",
        accentColor: DEFAULT_ACCENT,
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

  const markFutureControls = () => {
    document.querySelectorAll(".js-settings-theme[value='custom'], .js-settings-font, .js-settings-density, .js-settings-language").forEach((input) => {
      input.closest(".settings-option")?.classList.add("settings-option--future");
    });
  };

  /* --- Appearance helpers keep settings focused on the exam-safe dark/light theme. --- */
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

  const syncCustomPanel = () => {
    if (!customThemePanel) return;

    customThemePanel.dataset.enabled = "false";
    customThemePanel.querySelectorAll("input, button").forEach((control) => {
      control.disabled = true;
    });
  };

  const applySettings = (settings) => {
    document.documentElement.dataset.fontSize = "medium";
    document.body.dataset.density = "comfortable";
    document.documentElement.lang = "en";
    applyAccentColor(DEFAULT_ACCENT);

    setChecked(".js-settings-theme", settings.themeMode);
    setChecked(".js-settings-font", "medium");
    setChecked(".js-settings-density", "comfortable");
    setChecked(".js-settings-language", "en");
    syncCustomPanel();

    const accentInput = document.querySelector(".js-settings-accent");

    if (accentInput) {
      accentInput.value = DEFAULT_ACCENT;
    }
  };

  const showFutureSettingsToast = () => window.crmToast?.show(FUTURE_SETTINGS_MESSAGE, "info");

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
  markFutureControls();
  applySettings(settings);
  setTheme(settings.themeMode);

  window.addEventListener("crm:themechange", (event) => {
    const changedTheme = event.detail && event.detail.theme === "light" ? "light" : "dark";

    if (settings.themeMode === "custom" && settings.customTheme === changedTheme) return;
    if (settings.themeMode === changedTheme) return;

    settings = {
      ...settings,
      themeMode: changedTheme,
      customTheme: "dark",
      fontSize: "medium",
      density: "comfortable",
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
          themeMode: document.body.dataset.theme === "light" ? "light" : "dark",
          customTheme: "dark",
          fontSize: "medium",
          density: "comfortable",
          accentColor: DEFAULT_ACCENT,
        };
        applySettings(settings);
        saveSettings(settings);
        showFutureSettingsToast();
        return;
      }

      settings = {
        ...settings,
        themeMode: target.value,
        customTheme: "dark",
        fontSize: "medium",
        density: "comfortable",
        accentColor: DEFAULT_ACCENT,
      };
      setTheme(target.value);
      applySettings(settings);
      saveSettings(settings);
      return;
    }

    if (target.matches(".js-settings-font")) {
      settings = { ...settings, fontSize: "medium" };
      applySettings(settings);
      saveSettings(settings);
      showFutureSettingsToast();
      return;
    }

    if (target.matches(".js-settings-density")) {
      settings = { ...settings, density: "comfortable" };
      applySettings(settings);
      saveSettings(settings);
      showFutureSettingsToast();
      return;
    }

    if (target.matches(".js-settings-language")) {
      settings = { ...settings, language: "en" };
      window.crmI18n?.setLanguage(settings.language);
      applySettings(settings);
      saveSettings(settings);
      return;
    }

    if (target.matches(".js-settings-accent")) {
      settings = { ...settings, accentColor: DEFAULT_ACCENT };
      applySettings(settings);
      saveSettings(settings);
      showFutureSettingsToast();
      return;
    }

    applySettings(settings);
    saveSettings(settings);
  });

  document.addEventListener("click", (event) => {
    const swatch = event.target.closest("[data-accent-color]");

    if (!swatch) return;

    settings = { ...settings, accentColor: DEFAULT_ACCENT };
    applySettings(settings);
    saveSettings(settings);
    showFutureSettingsToast();
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(".js-delete-account-trigger");

    if (!trigger || !deleteAccountForm) return;

    deleteAccountForm.reset();
    setDeleteAccountError("");
  });

  deleteAccountForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const password = deleteAccountForm.querySelector(".js-delete-account-password")?.value.trim();
    const submitButton = deleteAccountForm.querySelector("[type='submit']");

    if (!password) {
      setDeleteAccountError("Please enter your password.");
      return;
    }

    if (!data?.hasApiSession?.() || !data?.deleteAccountRequest) {
      setDeleteAccountError("Your account could not be verified. Please log in again.");
      return;
    }

    try {
      setDeleteAccountError("");

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Deleting...";
      }

      await data.deleteAccountRequest(password);
      clearAccountData();
      window.location.href = "./index.html";
    } catch (error) {
      setDeleteAccountError(error.message || "Password does not match this account.");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Delete Account";
      }
    }
  });
})();
