"use strict";

(function initLiveHeader() {
  const dateElement = document.querySelector(".js-live-date");
  const clockElement = document.querySelector(".js-live-clock");
  const timezoneElement = document.querySelector(".js-live-timezone");
  const greetingElement = document.querySelector(".js-dynamic-greeting");

  if (!dateElement && !clockElement && !greetingElement) return;

  const dayParts = [
    { from: 5, to: 12, label: "Good morning", icon: "./assets/icons/Morning.svg" },
    { from: 12, to: 17, label: "Good afternoon", icon: "./assets/icons/Afternoon.svg" },
    { from: 17, to: 21, label: "Good evening", icon: "./assets/icons/evening.svg" },
    { from: 21, to: 24, label: "Good night", icon: "./assets/icons/night.svg" },
    { from: 0, to: 5, label: "Good night", icon: "./assets/icons/night.svg" },
  ];

  const getDayPart = (hour) => dayParts.find((part) => hour >= part.from && hour < part.to) || dayParts[0];

  const formatDate = (date) =>
    date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatTime = (date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const tick = () => {
    const now = new Date();
    const dayPart = getDayPart(now.getHours());

    if (dateElement) {
      dateElement.textContent = formatDate(now);
      dateElement.dateTime = now.toISOString();
    }

    if (clockElement) {
      clockElement.textContent = formatTime(now);
    }

    if (timezoneElement) {
      timezoneElement.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time";
    }

    if (greetingElement) {
      greetingElement.innerHTML = `
        <span>${dayPart.label},</span>
        <img class="welcome-panel__greeting-icon" src="${dayPart.icon}" alt="" aria-hidden="true" />
      `;
    }

    window.dispatchEvent(new CustomEvent("crm:clocktick", { detail: { now } }));
  };

  tick();
  window.setInterval(tick, 1000);
})();