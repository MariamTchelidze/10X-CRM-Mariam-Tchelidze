"use strict";

/* --- Live Clock and Client Timezone Modal --- */
(function initLiveClockModal() {
  const protectedPage = document.querySelector(".dashboardPage, .clientsPage, .profilePage");
  const clockCards = Array.from(document.querySelectorAll(".date-card"));
  const storage = window.crmStorage;
  const constants = window.crmConstants;

  if (!protectedPage || !clockCards.length || !storage || !constants) return;

  const PHONE_TIMEZONES = [
    { code: "+995", country: "Georgia", timezone: "Asia/Tbilisi" },
    { code: "+64", country: "New Zealand", timezone: "Pacific/Auckland" },
    { code: "+1", country: "United States / Canada", timezone: "America/New_York" },
    { code: "+44", country: "United Kingdom", timezone: "Europe/London" },
    { code: "+49", country: "Germany", timezone: "Europe/Berlin" },
    { code: "+33", country: "France", timezone: "Europe/Paris" },
    { code: "+39", country: "Italy", timezone: "Europe/Rome" },
    { code: "+34", country: "Spain", timezone: "Europe/Madrid" },
    { code: "+31", country: "Netherlands", timezone: "Europe/Amsterdam" },
    { code: "+48", country: "Poland", timezone: "Europe/Warsaw" },
    { code: "+90", country: "Turkey", timezone: "Europe/Istanbul" },
    { code: "+971", country: "United Arab Emirates", timezone: "Asia/Dubai" },
    { code: "+91", country: "India", timezone: "Asia/Kolkata" },
    { code: "+81", country: "Japan", timezone: "Asia/Tokyo" },
    { code: "+82", country: "South Korea", timezone: "Asia/Seoul" },
    { code: "+86", country: "China", timezone: "Asia/Shanghai" },
    { code: "+61", country: "Australia", timezone: "Australia/Sydney" },
    { code: "+55", country: "Brazil", timezone: "America/Sao_Paulo" },
    { code: "+52", country: "Mexico", timezone: "America/Mexico_City" },
  ].sort((a, b) => b.code.length - a.code.length);

  const escapeHtml = (value) =>
    String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const readClients = () => {
    const clients = storage.read(constants.CLIENTS_KEY, []);
    return Array.isArray(clients) ? clients : [];
  };

  const normalizePhone = (phone = "") => String(phone).replace(/[^\d+]/g, "");

  const detectCountry = (phone = "") => {
    const normalized = normalizePhone(phone);
    if (!normalized.startsWith("+")) return null;
    return PHONE_TIMEZONES.find((item) => normalized.startsWith(item.code)) || null;
  };

  const getClientTimezone = (client) => {
    if (client?.country && client?.timezone) {
      return {
        country: client.country,
        timezone: client.timezone,
      };
    }

    if (client?.timezone) {
      return {
        country: client.timezone,
        timezone: client.timezone,
      };
    }

    return detectCountry(client?.phone);
  };

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

  const getTimezoneOffset = (timezone, date = new Date()) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    }).formatToParts(date);
    return parts.find((part) => part.type === "timeZoneName")?.value || timezone;
  };

  const updateThemeAssets = (container) => {
    const theme = window.crmTheme?.getTheme?.() || document.body.dataset.theme || "dark";
    container.querySelectorAll("[data-theme-src-dark][data-theme-src-light]").forEach((element) => {
      const source = theme === "light" ? element.dataset.themeSrcLight : element.dataset.themeSrcDark;
      if (source) element.setAttribute("src", source);
    });
  };

  const getCallStatus = (date, timezone) => {
    const hour = Number(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: timezone,
        hour: "2-digit",
        hour12: false,
      }).format(date),
    );

    if (hour >= 9 && hour < 18) return { label: "Good time to call", state: "good" };
    if ((hour >= 8 && hour < 9) || (hour >= 18 && hour < 20)) return { label: "Maybe acceptable", state: "warning" };
    return { label: "Late hours", state: "late" };
  };

  const getCountryGroups = () => {
    const groups = new Map();
    let unknownCount = 0;

    readClients().forEach((client) => {
      const match = getClientTimezone(client);
      if (!match) {
        unknownCount += 1;
        return;
      }

      const current = groups.get(match.timezone) || {
        ...match,
        clients: [],
      };
      current.clients.push(client);
      groups.set(match.timezone, current);
    });

    return {
      countries: Array.from(groups.values()).sort((a, b) => a.country.localeCompare(b.country)),
      unknownCount,
    };
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
    /* --- DOM references collect animated clock and country-time list elements. --- */
  const modal = document.getElementById("live-clock-modal");
    if (!modal) return;
    modal.hidden = true;
    modal.dataset.modalState = "closed";
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  const renderClientTimes = (now) => {
    const modal = ensureModal();
    const list = modal.querySelector(".js-client-time-list");
    const count = modal.querySelector(".js-client-time-count");
    const { countries, unknownCount } = getCountryGroups();

    if (count) {
      count.textContent = `${countries.length} countr${countries.length === 1 ? "y" : "ies"}`;
    }

    if (!countries.length) {
      list.innerHTML = `
        <p class="task-empty">
          No client country times detected yet. Choose a client country/timezone or add international phone codes such as +64, +995, +1, +44, +49, or +81.
          ${unknownCount ? `${unknownCount} client${unknownCount === 1 ? "" : "s"} had no recognized country code.` : ""}
        </p>
      `;
      return;
    }

    list.innerHTML = countries
      .map((item) => {
        const callStatus = getCallStatus(now, item.timezone);
        return `
          <article class="client-time-card client-time-card--${callStatus.state}">
            <div>
              <h4 class="client-time-card__country">${escapeHtml(item.country)}</h4>
              <p class="client-time-card__meta">${escapeHtml(item.timezone)} - ${escapeHtml(getTimezoneOffset(item.timezone, now))}</p>
              <p class="client-time-card__clients">${item.clients.length} client${item.clients.length === 1 ? "" : "s"}</p>
            </div>
            <div class="client-time-card__timebox">
              <strong class="client-time-card__time">${formatTime(now, item.timezone, false)}</strong>
              <span class="client-time-card__date">${escapeHtml(formatDate(now, item.timezone))}</span>
              <span class="client-time-card__status">${callStatus.label}</span>
            </div>
          </article>
        `;
      })
      .join("");
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
