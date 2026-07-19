"use strict";

/* --- Theme and Accent Controller --- */
(function initThemeController() {
  const THEME_KEY = "crm_theme";
  const THEMES = {
    dark: "dark",
    light: "light",
  };

  const getStoredTheme = () => {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (error) {
      return null;
    }
  };

  const saveTheme = (theme) => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      // Theme still changes for the current page even if storage is unavailable.
    }
  };

  const getInitialTheme = () => {
    const storedTheme = getStoredTheme();

    if (storedTheme === THEMES.dark || storedTheme === THEMES.light) {
      return storedTheme;
    }

    return THEMES.dark;
  };

  const getThemeAsset = (element, theme) => {
    return theme === THEMES.light ? element.dataset.themeSrcLight : element.dataset.themeSrcDark;
  };

  const updateThemeAssets = (theme) => {
    document.querySelectorAll("[data-theme-src-dark][data-theme-src-light]").forEach((element) => {
      const nextSource = getThemeAsset(element, theme);

      if (nextSource) {
        element.setAttribute("src", nextSource);
      }
    });
  };

  const updateToggleButtons = (theme) => {
    const isLight = theme === THEMES.light;
    const label = isLight ? "Light" : "Dark";

    document.querySelectorAll(".js-theme-toggle").forEach((button) => {
      button.setAttribute("aria-pressed", String(isLight));
      button.setAttribute("aria-label", `Switch to ${isLight ? "dark" : "light"} theme`);

      const labelElement = button.querySelector(".js-theme-label");

      if (labelElement) {
        labelElement.textContent = label;
      }
    });
  };

  const applyTheme = (theme, shouldSave = true) => {
    const nextTheme = theme === THEMES.light ? THEMES.light : THEMES.dark;

    document.documentElement.dataset.theme = nextTheme;
    document.body.dataset.theme = nextTheme;
    document.body.classList.toggle("theme-light", nextTheme === THEMES.light);
    document.body.classList.toggle("theme-dark", nextTheme === THEMES.dark);

    updateThemeAssets(nextTheme);
    updateToggleButtons(nextTheme);

    if (shouldSave) {
      saveTheme(nextTheme);
    }

    window.dispatchEvent(new CustomEvent("crm:themechange", { detail: { theme: nextTheme } }));
  };

  const toggleTheme = () => {
    const currentTheme = document.body.dataset.theme === THEMES.light ? THEMES.light : THEMES.dark;
    applyTheme(currentTheme === THEMES.light ? THEMES.dark : THEMES.light);
  };

  document.addEventListener("crm:theme:set", (event) => {
    const requestedTheme = event.detail && event.detail.theme;

    if (requestedTheme === THEMES.dark || requestedTheme === THEMES.light) {
      applyTheme(requestedTheme);
    }
  });

  window.crmTheme = {
    applyTheme,
    toggleTheme,
    getTheme: () => (document.body.dataset.theme === THEMES.light ? THEMES.light : THEMES.dark),
  };

  document.addEventListener("click", (event) => {
    const toggle = event.target.closest(".js-theme-toggle");

    if (!toggle) return;

    toggleTheme();
  });

  if (document.body) {
    applyTheme(getInitialTheme(), false);
  } else {
    document.addEventListener("DOMContentLoaded", () => applyTheme(getInitialTheme(), false), { once: true });
  }
})();
