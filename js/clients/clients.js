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
  const deleteModal = document.getElementById("delete-client-modal");
  const confirmDeleteButton = document.querySelector(".js-confirm-delete-client");
  let clients = storage.read(constants.CLIENTS_KEY, []);
  let pendingDeleteId = null;

  const setLoading = (isLoading) => {
    if (loading) loading.hidden = !isLoading;
    if (error) error.hidden = true;
  };

  const setError = () => {
    if (loading) loading.hidden = true;
    if (error) error.hidden = false;
  };

  const saveClients = () => {
    storage.write(constants.CLIENTS_KEY, clients);
  };

  const updateSummary = () => {
    document.getElementById("clients-count-total").textContent = clients.length;
    document.getElementById("clients-count-lead").textContent = clients.filter((client) => client.status === "lead").length;
    document.getElementById("clients-count-contacted").textContent = clients.filter((client) => client.status === "contacted").length;
    document.getElementById("clients-count-won").textContent = clients.filter((client) => client.status === "won").length;
  };

  const renderClients = () => {
    list.innerHTML = "";
    clients.forEach((client) => list.append(cards.renderClientCard(client)));
    empty.hidden = clients.length > 0;
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
      window.crmToast?.show("Clients could not be loaded.", "error");
    }
  };

  const closeClientModal = () => {
    document.querySelector("#client-modal [data-modal-close]")?.click();
  };

  const openDeleteModal = () => {
    deleteModal.hidden = false;
    deleteModal.dataset.modalState = "open";
    deleteModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const closeDeleteModal = () => {
    deleteModal.hidden = true;
    deleteModal.dataset.modalState = "closed";
    deleteModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const draft = formHelpers.getFormClient(form);

    if (!formHelpers.validateClient(form, draft, clients)) return;

    try {
      const apiClient = await data.postClient(draft);
      const client = {
        ...draft,
        id: apiClient.id || Date.now(),
        createdAt: new Date().toISOString(),
      };

      clients.unshift(client);
      saveClients();
      renderClients();
      form.reset();
      closeClientModal();
      window.crmToast?.show("Client added âœ“", "success");
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
      window.crmToast?.show("Client deleted", "success");
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

  loadClients();
}
