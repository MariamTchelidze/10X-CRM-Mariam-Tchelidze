"use strict";

const clientsPage = document.querySelector(".clientsPage");

initClients();

function initClients() {
  if (!clientsPage) return;

  const constants = window.crmConstants;
  const storage = window.crmStorage;
  const data = window.crmData;
  const cards = window.crmClientCards;
  const formHelpers = window.crmClientForm;

  if (!constants || !storage || !data || !cards || !formHelpers) return;

  const list = document.getElementById("clients-list");
  const loading = document.getElementById("clients-loading");
  const error = document.getElementById("clients-error");
  const empty = document.getElementById("clients-empty");
  const form = document.querySelector(".js-client-form");
  const retryButton = document.querySelector(".js-retry-clients");
  const searchInput = document.querySelector(".js-client-search");
  const sortSelect = document.querySelector(".js-client-sort");
  const statusFilters = document.querySelectorAll(".js-status-filter");
  const deleteModal = document.getElementById("delete-client-modal");
  const confirmDeleteButton = document.querySelector(".js-confirm-delete");

  if (!list) return;

  let clients = storage.read(constants.CLIENTS_KEY, []);
  let activeStatus = "all";
  let pendingDeleteId = null;

  const getSummaryElement = (id) => document.getElementById(id);

  const setLoading = (isLoading) => {
    if (loading) loading.hidden = !isLoading;
    if (error) error.hidden = true;
    if (empty && isLoading) empty.hidden = true;
  };

  const setError = () => {
    if (loading) loading.hidden = true;
    if (error) error.hidden = false;
    if (empty) empty.hidden = true;
  };

  const saveClients = () => {
    storage.write(constants.CLIENTS_KEY, clients);
  };

  const updateSummary = () => {
    getSummaryElement("clients-count-total").textContent = clients.length;
    getSummaryElement("clients-count-lead").textContent = clients.filter((client) => client.status === "lead").length;
    getSummaryElement("clients-count-contacted").textContent = clients.filter((client) => client.status === "contacted").length;
    getSummaryElement("clients-count-won").textContent = clients.filter((client) => client.status === "won").length;
  };

  const getFilteredClients = () => {
    const query = String(searchInput?.value || "").trim().toLowerCase();
    const sortValue = sortSelect?.value || "created-desc";

    const filteredClients = clients.filter((client) => {
      const matchesStatus = activeStatus === "all" || client.status === activeStatus;
      const searchableText = [client.name, client.company, client.email, client.phone].join(" ").toLowerCase();
      const matchesSearch = !query || searchableText.includes(query);

      return matchesStatus && matchesSearch;
    });

    return filteredClients.sort((firstClient, secondClient) => {
      const firstName = String(firstClient.name || "").toLowerCase();
      const secondName = String(secondClient.name || "").toLowerCase();
      const firstValue = Number(firstClient.dealValue) || 0;
      const secondValue = Number(secondClient.dealValue) || 0;
      const firstCreated = new Date(firstClient.createdAt || 0).getTime();
      const secondCreated = new Date(secondClient.createdAt || 0).getTime();

      if (sortValue === "name-asc") return firstName.localeCompare(secondName);
      if (sortValue === "name-desc") return secondName.localeCompare(firstName);
      if (sortValue === "value-desc") return secondValue - firstValue;
      if (sortValue === "value-asc") return firstValue - secondValue;

      return secondCreated - firstCreated;
    });
  };

  const renderClients = () => {
    const visibleClients = getFilteredClients();

    list.innerHTML = "";
    visibleClients.forEach((client) => list.append(cards.renderClientCard(client)));

    if (empty) {
      empty.hidden = visibleClients.length > 0;
    }

    updateSummary();
  };

  const loadClients = async () => {
    if (clients.length) {
      renderClients();
      return;
    }

    setLoading(true);

    try {
      clients = await data.fetchInitialClients();
      saveClients();
      renderClients();
      setLoading(false);
    } catch (error) {
      setError();
      window.crmToast?.show("Could not load clients. Check your connection and try again.", "error");
    }
  };

  const closeClientModal = () => {
    document.querySelector("#client-modal [data-modal-close]")?.click();
  };

  const openDeleteModal = () => {
    if (!deleteModal) return;

    deleteModal.hidden = false;
    deleteModal.dataset.modalState = "open";
    deleteModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const closeDeleteModal = () => {
    if (!deleteModal) return;

    deleteModal.hidden = true;
    deleteModal.dataset.modalState = "closed";
    deleteModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  const setActiveStatusFilter = (selectedButton) => {
    statusFilters.forEach((button) => {
      button.classList.toggle("filter-chip--active", button === selectedButton);
    });

    activeStatus = selectedButton?.dataset.statusFilter || "all";
    renderClients();
  };

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const draft = formHelpers.getFormClient(form);

    if (!formHelpers.validateClient(form, draft, clients)) return;

    try {
      const apiClient = await data.postClient(draft);
      const client = {
        ...draft,
        id: apiClient.id || window.crypto?.randomUUID?.() || Date.now(),
        createdAt: new Date().toISOString(),
      };

      clients.unshift(client);
      saveClients();
      renderClients();
      form.reset();
      closeClientModal();
      window.crmToast?.show("Client added successfully.", "success");
    } catch (error) {
      window.crmToast?.show("Client could not be added.", "error");
    }
  });

  list.addEventListener("click", (event) => {
    const deleteButton = event.target.closest(".js-delete-client");

    if (!deleteButton) return;

    pendingDeleteId = deleteButton.closest(".client-card")?.dataset.clientId || null;

    if (pendingDeleteId) {
      openDeleteModal();
    }
  });

  confirmDeleteButton?.addEventListener("click", async () => {
    if (!pendingDeleteId) return;

    try {
      await data.deleteClientRequest(pendingDeleteId);
      clients = clients.filter((client) => String(client.id) !== String(pendingDeleteId));
      saveClients();
      renderClients();
      closeDeleteModal();
      window.crmToast?.show("Client deleted.", "success");
    } catch (error) {
      window.crmToast?.show("Client could not be deleted.", "error");
    } finally {
      pendingDeleteId = null;
    }
  });

  deleteModal?.querySelectorAll("[data-modal-close]").forEach((button) => {
    button.addEventListener("click", () => {
      pendingDeleteId = null;
      closeDeleteModal();
    });
  });

  retryButton?.addEventListener("click", loadClients);
  searchInput?.addEventListener("input", renderClients);
  sortSelect?.addEventListener("change", renderClients);
  statusFilters.forEach((button) => {
    button.addEventListener("click", () => setActiveStatusFilter(button));
  });

  loadClients();
}
