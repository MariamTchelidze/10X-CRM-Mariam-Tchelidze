"use strict";

/* --- Future Localization Placeholder --- */
(function initTranslationsPlaceholder() {
  const LANGUAGE_MESSAGE = "Localization is prepared for future integration.";
  const DEFAULT_LANGUAGE = "en";

  const setLanguageButtons = () => {
    document.documentElement.lang = DEFAULT_LANGUAGE;

    document.querySelectorAll(".js-language-toggle").forEach((button) => {
      const isEnglish = button.dataset.language === DEFAULT_LANGUAGE;
      button.setAttribute("aria-pressed", String(isEnglish));
    });

    document.querySelectorAll(".js-settings-language").forEach((input) => {
      input.checked = input.value === DEFAULT_LANGUAGE;
    });
  };

  const showLanguageToast = () => window.crmToast?.show(LANGUAGE_MESSAGE, "info");

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".js-language-toggle");
    if (!button) return;

    setLanguageButtons();
    showLanguageToast();
  });

  document.addEventListener("change", (event) => {
    const input = event.target.closest(".js-settings-language");
    if (!input) return;

    setLanguageButtons();
    showLanguageToast();
  });

  window.crmI18n = {
    getLanguage: () => DEFAULT_LANGUAGE,
    setLanguage: () => {
      setLanguageButtons();
      showLanguageToast();
    },
  };

  setLanguageButtons();
})();
