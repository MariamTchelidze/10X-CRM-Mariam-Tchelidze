"use strict";

(function initClientFormHelpers() {
  const getFormClient = (form) => {
    const formData = new FormData(form);
    const notesText = String(formData.get("notes") || "").trim();
    const timezoneSelect = form.querySelector("#client-timezone");
    const selectedTimezone = timezoneSelect?.selectedOptions?.[0];

    return {
      name: String(formData.get("name") || "").trim(),
      company: String(formData.get("company") || "").trim(),
      email: String(formData.get("email") || "").trim().toLowerCase(),
      phone: String(formData.get("phone") || "").trim(),
      country: String(selectedTimezone?.dataset.country || "").trim(),
      timezone: String(formData.get("timezone") || "").trim(),
      status: String(formData.get("status") || "lead"),
      dealValue: Number(formData.get("value")),
      notes: notesText ? [{ text: notesText, date: new Date().toLocaleString() }] : [],
    };
  };

  const validateClient = (form, client, clients, ignoredClientId = null) => {
    const validation = window.crmValidation;
    let isValid = true;

    validation.clearFormErrors(form);

    if (client.name.length < 3) {
      validation.setFieldError(form.querySelector("#client-name"), "Name must be at least 3 characters");
      isValid = false;
    }

    if (!validation.emailIsValid(client.email)) {
      validation.setFieldError(form.querySelector("#client-email"), "Please enter a valid email address");
      isValid = false;
    } else if (
      clients.some((item) =>
        item.email.toLowerCase() === client.email && String(item.id) !== String(ignoredClientId),
      )
    ) {
      validation.setFieldError(form.querySelector("#client-email"), "A client with this email already exists");
      isValid = false;
    }

    if (client.phone && client.phone.length < 6) {
      validation.setFieldError(form.querySelector("#client-phone"), "Phone number looks too short");
      isValid = false;
    }

    if (!Number.isFinite(client.dealValue) || client.dealValue <= 0) {
      validation.setFieldError(form.querySelector("#client-value"), "Deal value must be a positive number");
      isValid = false;
    }

    return isValid;
  };

  window.crmClientForm = {
    getFormClient,
    validateClient,
  };
})();
