"use strict";

/* --- Local Storage Wrapper --- */
(function initStorageHelpers() {
  /* --- Reads JSON safely and falls back when localStorage is empty or corrupted. --- */
  const read = (key, fallback = null) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value ?? fallback;
    } catch (error) {
      return fallback;
    }
  };

  /* --- Stores structured data as JSON strings. --- */
  const write = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  /* --- Deletes one saved value by key. --- */
  const remove = (key) => {
    localStorage.removeItem(key);
  };

  window.crmStorage = { read, write, remove };
})();
