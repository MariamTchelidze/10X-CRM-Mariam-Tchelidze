"use strict";

/* --- Theme Aware Select Icons --- */
(function initIconSelects() {
  /* --- Select icon preview follows the active theme. --- */
  const getTheme = () => (document.body.dataset.theme === "light" ? "light" : "dark");

  /* --- Reads the selected option icon and paints the custom preview. --- */
  const updateSelectIcon = (select) => {
    const wrapper = select.closest(".js-icon-select") || select.parentElement;
    const option = select.selectedOptions[0];
    const preview = wrapper?.querySelector(".js-select-icon-preview");

    if (!preview || !option) return;

    const icon = getTheme() === "light" ? option.dataset.iconLight || option.dataset.icon : option.dataset.icon;
    preview.style.setProperty("--select-icon", icon ? `url("${icon}")` : "none");
  };

  document.querySelectorAll(".js-icon-select select, .js-icon-select-control").forEach((select) => {
    if (!select.closest(".js-icon-select")) {
      select.parentElement?.classList.add("select-field--icon", "js-icon-select");
      const preview = document.createElement("span");
      preview.className = "select-field__icon-preview js-select-icon-preview";
      preview.setAttribute("aria-hidden", "true");
      select.parentElement?.insertBefore(preview, select);
    }

    updateSelectIcon(select);
    select.addEventListener("change", () => updateSelectIcon(select));
  });

  window.addEventListener("crm:themechange", () => {
    document.querySelectorAll(".js-icon-select select, .js-icon-select-control").forEach(updateSelectIcon);
  });
})();
