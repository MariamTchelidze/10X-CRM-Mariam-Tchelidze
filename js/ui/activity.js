"use strict";

/* --- Shared Activity Log --- */
(function initActivityLog() {
  const constants = window.crmConstants;
  const storage = window.crmStorage;
  const data = window.crmData;

  if (!constants || !storage) return;

  const ACTIVITY_LIMIT = 80;

  /* --- Activity entries are explicit user events, never seeded demo data. --- */
  const read = () => {
    const entries = storage.read(constants.ACTIVITY_KEY, []);
    return Array.isArray(entries) ? entries : [];
  };

  const write = (entries) => {
    storage.write(constants.ACTIVITY_KEY, Array.isArray(entries) ? entries : []);
    window.dispatchEvent(new CustomEvent("crm:activity:update", { detail: entries }));
  };

  const createId = () => {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `activity-${window.crypto.randomUUID()}`;
    }

    return `activity-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  };

  const normalizeEntry = (entry = {}) => ({
    ...entry,
    id: entry.id || entry._id || createId(),
    details: Array.isArray(entry.details) ? entry.details : [],
    createdAt: entry.createdAt || new Date().toISOString(),
  });

  const load = async () => {
    if (!data?.fetchActivity) return read();

    try {
      const entries = (await data.fetchActivity()).map(normalizeEntry);
      write(entries);
      return entries;
    } catch (error) {
      return read();
    }
  };

  const add = (entry = {}) => {
    const nextEntry = {
      id: createId(),
      type: entry.type || "general",
      icon: entry.icon || "clock",
      title: entry.title || "CRM activity",
      summary: entry.summary || "Account activity was recorded.",
      status: entry.status || "Updated",
      relatedLabel: entry.relatedLabel || "CRM",
      description: entry.description || entry.summary || "Account activity was recorded.",
      details: Array.isArray(entry.details) ? entry.details : [],
      actionHref: entry.actionHref || "./dashboard.html#activity",
      actionLabel: entry.actionLabel || "Open Activity",
      createdAt: entry.createdAt || new Date().toISOString(),
    };

    const entries = [nextEntry, ...read()].slice(0, ACTIVITY_LIMIT);
    write(entries);

    data?.postActivity?.(nextEntry)
      .then((apiEntry) => {
        if (!apiEntry) return;

        const syncedEntries = read().map((item) => (item.id === nextEntry.id ? normalizeEntry(apiEntry) : item));
        write(syncedEntries);
      })
      .catch(() => {});

    return nextEntry;
  };

  const clear = () => {
    write([]);
    data?.clearActivityRequest?.().catch(() => {});
  };

  window.crmActivity = { add, read, clear, load };
  load();
})();
