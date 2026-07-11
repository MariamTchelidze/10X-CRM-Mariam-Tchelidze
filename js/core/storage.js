"use strict";

(function initStorageHelpers() {
  const read = (key, fallback = null) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value ?? fallback;
    } catch (error) {
      return fallback;
    }
  };

  const write = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const remove = (key) => {
    localStorage.removeItem(key);
  };

  window.crmStorage = { read, write, remove };
})();
