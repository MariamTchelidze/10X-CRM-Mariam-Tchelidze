"use strict";

(function initSidebarDropdowns() {
  const dropdowns = document.querySelectorAll(".sidebar-dropdown");

  if (!dropdowns.length) return;

  const getCurrentTheme = () => (document.body.dataset.theme === "light" ? "light" : "dark");

  const updateArrow = (dropdown) => {
    const arrow = dropdown.querySelector(".sidebar-dropdown__arrow");

    if (!arrow) return;

    const state = dropdown.open ? "up" : "down";
    const theme = getCurrentTheme();
    const sourceKey = `arrowSrc${state[0].toUpperCase()}${state.slice(1)}${theme[0].toUpperCase()}${theme.slice(1)}`;
    const source = arrow.dataset[sourceKey];

    if (source) {
      arrow.src = source;
    }
  };

  const updateAllArrows = () => {
    dropdowns.forEach(updateArrow);
  };

  dropdowns.forEach((dropdown) => {
    dropdown.addEventListener("toggle", () => updateArrow(dropdown));
  });

  window.addEventListener("crm:themechange", updateAllArrows);
  updateAllArrows();
})();
