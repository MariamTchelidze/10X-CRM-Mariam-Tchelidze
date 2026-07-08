"use strict";

(function initSettingsPanel() {
  const STORAGE_KEY = "crm_app_settings";
  const DEFAULTS = {
    fontSize: "medium",
    density: "comfortable",
    language: "en",
    accentColor: "#ff6b1a",
  };

  const form = document.querySelector(".js-settings-form");

  const readSettings = () => {
    try {
      const settings = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return { ...DEFAULTS, ...settings };
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

  const applyAccentColor = (color) => {
    document.body.style.setProperty("--color-primary", color);
  };

  const applySettings = (settings) => {
    document.documentElement.dataset.fontSize = settings.fontSize;
    document.body.dataset.density = settings.density;
    document.documentElement.lang = settings.language;
    applyAccentColor(settings.accentColor);

    setChecked(".js-settings-font", settings.fontSize);
    setChecked(".js-settings-density", settings.density);
    setChecked(".js-settings-language", settings.language);

    const accentInput = document.querySelector(".js-settings-accent");

    if (accentInput) {
      accentInput.value = settings.accentColor;
    }
  };

  const setTheme = (theme) => {
    const nextTheme = theme === "light" ? "light" : "dark";

    if (window.crmTheme && typeof window.crmTheme.applyTheme === "function") {
      window.crmTheme.applyTheme(nextTheme);
      return;
    }

    document.dispatchEvent(new CustomEvent("crm:theme:set", { detail: { theme: nextTheme } }));
  };

  const syncThemeControl = (theme) => {
    const selectedTheme = document.querySelector(`.js-settings-theme[value="${theme}"]`);

    if (selectedTheme) {
      selectedTheme.checked = true;
    }
  };

  let settings = readSettings();
  applySettings(settings);
  syncThemeControl(document.body.dataset.theme === "light" ? "light" : "dark");

  window.addEventListener("crm:themechange", (event) => {
    syncThemeControl(event.detail && event.detail.theme === "light" ? "light" : "dark");
  });

  form?.addEventListener("change", (event) => {
    const target = event.target;

    if (target.matches(".js-settings-theme")) {
      if (target.value === "custom") {
        document.querySelector(".js-settings-accent")?.focus({ preventScroll: true });
        return;
      }

      setTheme(target.value);
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
    }

    if (target.matches(".js-settings-accent")) {
      settings = { ...settings, accentColor: target.value };
    }

    applySettings(settings);
    saveSettings(settings);
  });

  document.addEventListener("click", (event) => {
    const swatch = event.target.closest("[data-accent-color]");

    if (!swatch) return;

    settings = { ...settings, accentColor: swatch.dataset.accentColor || DEFAULTS.accentColor };
    applySettings(settings);
    saveSettings(settings);
  });
})();