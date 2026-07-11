"use strict";

(function initClientCardRenderer() {
  const moneyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const setText = (card, selector, value) => {
    const element = card.querySelector(selector);
    if (element) element.textContent = value;
  };

  const renderClientCard = (client) => {
    const template = document.getElementById("client-card-template");
    const card = template.content.firstElementChild.cloneNode(true);
    const status = client.status || "lead";
    const badge = card.querySelector("[data-client-status]");

    card.dataset.clientId = client.id;
    card.dataset.status = status;

    setText(card, "[data-client-initials]", window.crmData.getInitials(client.name));
    setText(card, "[data-client-name]", client.name);
    setText(card, "[data-client-company]", client.company || "No company");
    setText(card, "[data-client-email]", client.email);
    setText(card, "[data-client-phone]", client.phone || "No phone");
    setText(card, "[data-client-value]", moneyFormatter.format(Number(client.dealValue) || 0));

    if (badge) {
      badge.textContent = window.crmData.formatStatus(status);
      badge.className = `status-badge status-badge--${status}`;
    }

    return card;
  };

  window.crmClientCards = { renderClientCard };
})();
