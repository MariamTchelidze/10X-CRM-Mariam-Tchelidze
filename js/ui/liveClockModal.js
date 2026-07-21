"use strict";

/* --- Live Clock and Client Timezone Modal --- */
(function initLiveClockModal() {
  const protectedPage = document.querySelector(".dashboardPage, .clientsPage, .profilePage");
  const clockCards = Array.from(document.querySelectorAll(".date-card"));

  if (!protectedPage || !clockCards.length) return;

  const formatTime = (date, timezone, includeSeconds = true) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: includeSeconds ? "2-digit" : undefined,
      hour12: false,
    }).format(date);

  const formatDate = (date, timezone) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      weekday: "short",
      day: "2-digit",
      month: "short",
    }).format(date);

  const updateThemeAssets = (container) => {
    const theme = window.crmTheme?.getTheme?.() || document.body.dataset.theme || "dark";
    container.querySelectorAll("[data-theme-src-dark][data-theme-src-light]").forEach((element) => {
      const source = theme === "light" ? element.dataset.themeSrcLight : element.dataset.themeSrcDark;
      if (source) element.setAttribute("src", source);
    });
  };

  const ensureModal = () => {
    let modal = document.getElementById("live-clock-modal");
    if (modal) return modal;

    modal = document.createElement("section");
    modal.className = "modal live-clock-modal";
    modal.id = "live-clock-modal";
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="modal__dialog modal__dialog--live-clock" role="dialog" aria-modal="true" aria-labelledby="live-clock-title">
        <header class="modal__header">
          <div>
            <p class="modal__eyebrow">Time center</p>
            <h2 class="modal__title" id="live-clock-title">Live Clock</h2>
            <p class="modal__description">Check your time and client country times before calling or messaging.</p>
          </div>
          <button class="icon-btn js-live-clock-close" type="button" aria-label="Close live clock">
            <img src="./assets/icons/close.svg" data-theme-src-dark="./assets/icons/close.svg" data-theme-src-light="./assets/icons/close-light-theme.svg" alt="" />
          </button>
        </header>
        <div class="modal__body live-clock">
          <section class="live-clock__hero" aria-label="Local animated clock">
            <div class="live-clock-ring js-live-clock-ring" aria-hidden="true"></div>
            <div class="live-clock__center">
              <span class="live-clock__time js-live-clock-modal-time">--:--:--</span>
              <span class="live-clock__date js-live-clock-modal-date">Local date</span>
              <span class="live-clock__zone js-live-clock-modal-zone">Local timezone</span>
            </div>
          </section>
          <section class="client-time-panel" aria-labelledby="client-time-title">
            <div class="client-time-panel__header">
              <div>
                <p class="modal__eyebrow">Client countries</p>
                <h3 class="client-time-panel__title" id="client-time-title">Country Time List</h3>
              </div>
              <span class="status-badge status-badge--neutral js-client-time-count">0 countries</span>
            </div>
            <div class="client-time-list js-client-time-list">
              <p class="task-empty">No client country times detected yet.</p>
            </div>
          </section>
        </div>
      </div>
    `;
    document.body.append(modal);
    updateThemeAssets(modal);

    const ring = modal.querySelector(".js-live-clock-ring");
    ring.innerHTML = Array.from({ length: 60 }, (_, index) => `<span class="live-clock-ring__tick" style="--tick-index: ${index}"></span>`).join("");

    modal.querySelectorAll(".js-live-clock-close").forEach((button) => button.addEventListener("click", closeModal));
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) closeModal();
    });

    return modal;
  };

  const openModal = () => {
    const modal = ensureModal();
    modal.hidden = false;
    modal.dataset.modalState = "open";
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    renderClock();
    modal.querySelector(".js-live-clock-close")?.focus();
  };

  const closeModal = () => {
    const modal = document.getElementById("live-clock-modal");
    if (!modal) return;
    modal.hidden = true;
    modal.dataset.modalState = "closed";
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  const renderClientTimes = () => {
    const modal = ensureModal();
    const list = modal.querySelector(".js-client-time-list");
    const count = modal.querySelector(".js-client-time-count");

    if (count) {
      count.textContent = "Future API";
    }

    if (list) {
      list.innerHTML = `
        <p class="task-empty">
          Client world clock is prepared for future timezone API integration.
        </p>
      `;
    }
  };

  const renderClock = (event) => {
    const modal = ensureModal();
    if (modal.hidden) return;

    const now = event?.detail?.now || new Date();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time";
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours() % 12;
    const secondIndex = seconds;
    const minuteIndex = minutes;
    const hourIndex = Math.round(((hours * 5) + minutes / 12)) % 60;

    modal.querySelector(".js-live-clock-modal-time").textContent = formatTime(now, timezone);
    modal.querySelector(".js-live-clock-modal-date").textContent = formatDate(now, timezone);
    modal.querySelector(".js-live-clock-modal-zone").textContent = timezone;

    modal.querySelectorAll(".live-clock-ring__tick").forEach((tick, index) => {
      tick.classList.toggle("is-second", index === secondIndex);
      tick.classList.toggle("is-minute", index === minuteIndex);
      tick.classList.toggle("is-hour", index === hourIndex);
      tick.classList.toggle("is-major", index % 5 === 0);
    });

    renderClientTimes(now);
  };

  clockCards.forEach((card) => {
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", "Open live time center");
    card.classList.add("date-card--interactive");
    card.addEventListener("click", openModal);
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openModal();
    });
  });

  window.addEventListener("crm:clocktick", renderClock);
  window.addEventListener("storage", () => {
    if (!document.getElementById("live-clock-modal")?.hidden) renderClock();
  });
})();
