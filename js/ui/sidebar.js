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

(function initResponsiveSidebar() {
  const sidebar = document.querySelector(".js-sidebar");
  const toggle = document.querySelector(".js-sidebar-toggle");
  const backdrop = document.querySelector(".js-sidebar-backdrop");
  const drawerQuery = window.matchMedia("(max-width: 930px)");

  if (!sidebar || !toggle || !backdrop) return;

  const setOpen = (isOpen) => {
    document.body.classList.toggle("is-sidebar-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    backdrop.hidden = !isOpen;
  };

  const closeSidebar = () => setOpen(false);

  toggle.addEventListener("click", () => {
    setOpen(!document.body.classList.contains("is-sidebar-open"));
  });

  backdrop.addEventListener("click", closeSidebar);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("is-sidebar-open")) {
      closeSidebar();
      toggle.focus({ preventScroll: true });
    }
  });

  sidebar.addEventListener("click", (event) => {
    const interactiveItem = event.target.closest("a, button");

    if (interactiveItem && drawerQuery.matches) {
      closeSidebar();
    }
  });

  drawerQuery.addEventListener("change", (event) => {
    if (!event.matches) {
      closeSidebar();
    }
  });
})();