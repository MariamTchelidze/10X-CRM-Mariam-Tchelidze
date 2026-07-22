"use strict";

/* --- Translation Placeholder Controller --- */
(function initTranslations() {
  const SETTINGS_KEY = "crm_app_settings";
  const LANGUAGE_KEY = "crm_language";
  const DEFAULT_LANGUAGE = "en";
  const PLACEHOLDER_MESSAGE = "This feature is UI ready and will be integrated later.";

  /* --- Settings helpers keep language storage aligned with exam-safe English. --- */
  const readSettings = () => {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    } catch (error) {
      return {};
    }
  };

  const writeSettingsLanguage = (language) => {
    const settings = readSettings();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...settings, language }));
  };

  /* --- The real app language stays English until Georgian translation is integrated. --- */
  const keepEnglishLanguage = () => {
    document.documentElement.lang = DEFAULT_LANGUAGE;
    localStorage.setItem(LANGUAGE_KEY, DEFAULT_LANGUAGE);
    writeSettingsLanguage(DEFAULT_LANGUAGE);
  };

  const updateLanguageControls = () => {
    document.querySelectorAll(".js-language-toggle").forEach((button) => {
      const isEnglish = button.dataset.language === DEFAULT_LANGUAGE;
      button.classList.toggle("language-toggle__button--active", isEnglish);
      button.setAttribute("aria-pressed", String(isEnglish));
    });

    document.querySelectorAll(".js-settings-language").forEach((input) => {
      input.checked = input.value === DEFAULT_LANGUAGE;
    });
  };

  const announceUnavailableLanguage = () => {
    window.crmToast?.show(PLACEHOLDER_MESSAGE, "info");
  };

  const notifyLanguageChange = (requestedLanguage, available) => {
    window.dispatchEvent(
      new CustomEvent("crm:languagechange", {
        detail: {
          language: DEFAULT_LANGUAGE,
          requestedLanguage,
          available,
        },
      })
    );
  };

  const setLanguage = (language = DEFAULT_LANGUAGE) => {
    const requestedLanguage = String(language).toLowerCase();
    const isEnglish = requestedLanguage === DEFAULT_LANGUAGE || requestedLanguage === "english";

    if (!isEnglish) {
      announceUnavailableLanguage();
    }

    keepEnglishLanguage();
    updateLanguageControls();
    notifyLanguageChange(requestedLanguage, isEnglish);

    return DEFAULT_LANGUAGE;
  };

  /* --- Public API keeps existing files compatible without running real translations. --- */
  window.crmI18n = {
    t: (_key, fallback = _key) => fallback,
    setLanguage,
    getLanguage: () => DEFAULT_LANGUAGE,
    applyTranslations: updateLanguageControls,
  };

  document.addEventListener("click", (event) => {
    const languageButton = event.target.closest(".js-language-toggle");

    if (!languageButton) return;

    setLanguage(languageButton.dataset.language);
  });

  keepEnglishLanguage();
  updateLanguageControls();
})();
