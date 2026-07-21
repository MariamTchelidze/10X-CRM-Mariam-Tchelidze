"use strict";

/* --- Shared Local Storage Keys --- */
window.crmConstants = {
  USERS_KEY: "crm_users",
  TEAM_MEMBERS_KEY: "crm_team_members",
  TEAM_ROLES_KEY: "crm_team_roles",
  SESSION_KEY: "crm_session",
  CLIENTS_KEY: "crm_clients",
  FILES_KEY: "crm_files",
  ACTIVITY_KEY: "crm_activity",
  THEME_KEY: "crm_theme",
  API_BASE_URL: window.CRM_API_BASE_URL || "http://localhost:5000/api",
  PAGES: {
    login: "index.html",
    signup: "signup.html",
    dashboard: "dashboard.html",
  },
};
