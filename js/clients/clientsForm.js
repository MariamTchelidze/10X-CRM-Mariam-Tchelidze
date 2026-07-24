"use strict";

/* --- Client Form Validation Helpers --- */
(function initClientFormHelpers() {
  /* --- Converts form fields into the client object used by state and storage. --- */
  const getFormClient = (form) => {
    const formData = new FormData(form);
    const notesText = String(formData.get("notes") || "").trim();
    const timezoneSelect = form.querySelector("#client-timezone");
    const selectedTimezone = timezoneSelect?.selectedOptions?.[0];
    const phone = String(formData.get("phone") || "")
      .trim()
      .replace(/[^\d+]/g, "")
      .replace(/(?!^)\+/g, "");

    return {
      name: String(formData.get("name") || "").trim(),
      company: String(formData.get("company") || "").trim(),
      email: String(formData.get("email") || "")
        .trim()
        .toLowerCase(),
      phone,
      country: String(selectedTimezone?.dataset.country || "").trim(),
      timezone: String(formData.get("timezone") || "").trim(),
      status: String(formData.get("status") || "lead"),
      dealValue: Number(formData.get("value")),
      notes: notesText ? [{ text: notesText, date: new Date().toLocaleString() }] : [],
    };
  };

  /* --- Restricts phone typing and pasted values to + at the start and digits only. --- */
  const bindPhoneInputFilter = (form) => {
    const phoneInput = form?.querySelector("#client-phone");

    if (!phoneInput || phoneInput.dataset.phoneFilterBound === "true") return;

    phoneInput.dataset.phoneFilterBound = "true";
    phoneInput.addEventListener("input", () => {
      const value = phoneInput.value.trim();
      const startsWithPlus = value.startsWith("+");
      const digitsOnly = value.replace(/[^0-9]/g, "");

      phoneInput.value = `${startsWithPlus ? "+" : ""}${digitsOnly}`;
    });
  };

  /* --- Validates required client fields and prevents duplicate emails. --- */
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
      clients.some((item) => item.email.toLowerCase() === client.email && String(item.id) !== String(ignoredClientId))
    ) {
      validation.setFieldError(form.querySelector("#client-email"), "A client with this email already exists");
      isValid = false;
    }

    if (client.phone && !/^\+?\d+$/.test(client.phone)) {
      validation.setFieldError(form.querySelector("#client-phone"), "Phone can contain only + and numbers");
      isValid = false;
    } else if (client.phone && client.phone.length < 6) {
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
    bindPhoneInputFilter,
  };
})();
