"use strict";

(function initDashboardSections() {
  const SECTION_META = {
    overview: { eyebrow: "Overview", title: "Dashboard" },
    sales: { eyebrow: "Workspace", title: "Sales" },
    reports: { eyebrow: "Workspace", title: "Reports" },
    favourites: { eyebrow: "Workspace", title: "Favourites" },
    activity: { eyebrow: "Workspace", title: "Activity" },
    files: { eyebrow: "Workspace", title: "Files" },
  };

  const views = Array.from(document.querySelectorAll(".js-dashboard-view"));
  const sectionLinks = Array.from(document.querySelectorAll("[data-dashboard-section-link]"));
  const title = document.querySelector(".app-header__title");
  const eyebrow = document.querySelector(".app-header__eyebrow");
  const dashboardLink = document.querySelector('[data-nav="dashboard"]');

  if (!views.length) return;

  const getHashSection = () => {
    const section = window.location.hash.replace("#", "");
    return SECTION_META[section] ? section : "overview";
  };

  const updateActiveLinks = (section) => {
    sectionLinks.forEach((link) => {
      const isActive = link.dataset.dashboardSectionLink === section;
      link.classList.toggle("sidebar__link--active", isActive);
      link.toggleAttribute("aria-current", isActive);
    });

    if (!dashboardLink) return;

    const isOverview = section === "overview";
    dashboardLink.classList.toggle("sidebar__link--active", isOverview);

    if (isOverview) {
      dashboardLink.setAttribute("aria-current", "page");
    } else {
      dashboardLink.removeAttribute("aria-current");
    }
  };

  const showSection = (section) => {
    const nextSection = SECTION_META[section] ? section : "overview";
    const meta = SECTION_META[nextSection];

    views.forEach((view) => {
      view.hidden = view.dataset.dashboardView !== nextSection;
    });

    if (title) {
      title.textContent = meta.title;
    }

    if (eyebrow) {
      eyebrow.textContent = meta.eyebrow;
    }

    updateActiveLinks(nextSection);
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-dashboard-section-link]");

    if (!link || link.origin !== window.location.origin || link.pathname !== window.location.pathname) return;

    event.preventDefault();
    window.location.hash = link.dataset.dashboardSectionLink;
    showSection(link.dataset.dashboardSectionLink);
  });

  window.addEventListener("hashchange", () => showSection(getHashSection()));

  showSection(getHashSection());
})();