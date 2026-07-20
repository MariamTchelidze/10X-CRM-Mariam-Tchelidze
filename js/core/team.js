"use strict";

/* --- Shared Team Data Helpers --- */
(function initTeamHelpers() {
  const constants = window.crmConstants;
  const storage = window.crmStorage;

  if (!constants || !storage) return;

  const TEAM_MEMBERS_KEY = constants.TEAM_MEMBERS_KEY || "crm_team_members";
  const TEAM_ROLES_KEY = constants.TEAM_ROLES_KEY || "crm_team_roles";

  const defaultRoles = [
    {
      id: "owner",
      name: "Owner",
      level: "Full access",
      permissions: ["Manage account", "Manage clients", "Manage tasks", "View reports", "Export files"],
    },
    {
      id: "manager",
      name: "Manager",
      level: "Team access",
      permissions: ["Manage clients", "Manage tasks", "View reports", "Export files"],
    },
    {
      id: "member",
      name: "Member",
      level: "Workspace access",
      permissions: ["View clients", "Update assigned tasks", "Use messenger"],
    },
  ];

  const escapeHtml = (value) =>
    String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const readArray = (key) => {
    const value = storage.read(key, []);
    return Array.isArray(value) ? value : [];
  };

  const getSession = () => {
    return storage.read(constants.SESSION_KEY, {}) || {};
  };

  const getUsers = () => readArray(constants.USERS_KEY);

  const getCurrentUser = () => {
    const session = getSession();
    const users = getUsers();
    const user = users.find((item) => item.id === session.userId || item.email === session.email);

    return user || null;
  };

  const getDisplayName = (user) => {
    return user?.fullName || user?.name || user?.email || "Account Owner";
  };

  const getRoleForUser = (user, index) => {
    if (user?.role) return user.role;
    return index === 0 ? "Owner" : "Member";
  };

  const getMembers = () => {
    const users = getUsers();
    const extraMembers = readArray(TEAM_MEMBERS_KEY);
    const userMembers = users.map((user, index) => ({
      id: String(user.id || user.email || index),
      name: getDisplayName(user),
      email: user.email || "",
      role: getRoleForUser(user, index),
      department: user.department || user.company || "Workspace",
      status: "Active",
      joinedAt: user.createdAt || "",
      source: "account",
    }));

    const members = [...userMembers, ...extraMembers].filter((member, index, list) => {
      const key = String(member.email || member.id || member.name).toLowerCase();
      return key && list.findIndex((item) => String(item.email || item.id || item.name).toLowerCase() === key) === index;
    });

    const currentUser = getCurrentUser();
    if (!members.length && currentUser) {
      return [
        {
          id: String(currentUser.id || currentUser.email),
          name: getDisplayName(currentUser),
          email: currentUser.email || "",
          role: "Owner",
          department: currentUser.company || "Workspace",
          status: "Active",
          joinedAt: currentUser.createdAt || "",
          source: "account",
        },
      ];
    }

    return members;
  };

  const getRoles = () => {
    const savedRoles = readArray(TEAM_ROLES_KEY);
    return savedRoles.length ? savedRoles : defaultRoles;
  };

  const getAssignableMembers = () => {
    return getMembers().map((member) => ({
      value: member.name,
      label: member.name,
      description: member.role,
    }));
  };

  const getCurrentUserName = () => {
    const currentUser = getCurrentUser();
    return getDisplayName(currentUser);
  };

  const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Recently";
    return date.toLocaleDateString("en-GB");
  };

  const getInitials = (name) =>
    String(name || "User")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.at(0)?.toUpperCase() || "")
      .join("") || "U";

  const updateThemeAssets = (container) => {
    const theme = window.crmTheme?.getTheme?.() || document.body.dataset.theme || "dark";
    container.querySelectorAll("[data-theme-src-dark][data-theme-src-light]").forEach((element) => {
      const source = theme === "light" ? element.dataset.themeSrcLight : element.dataset.themeSrcDark;
      if (source) element.setAttribute("src", source);
    });
  };

  const renderUsersSection = () => {
    const stats = document.querySelector(".js-team-users-stats");
    const list = document.querySelector(".js-team-users-list");
    if (!stats || !list) return;

    const members = getMembers();
    const activeMembers = members.filter((member) => member.status !== "Inactive");
    const roleCount = new Set(members.map((member) => member.role).filter(Boolean)).size;

    stats.innerHTML = `
      <article class="dashboard-panel-card">
        <img src="./assets/icons/team.svg" data-theme-src-dark="./assets/icons/team.svg" data-theme-src-light="./assets/icons/team-light-mode.svg" alt="" class="dashboard-panel-card__icon" />
        <span class="dashboard-panel-card__label">Active users</span>
        <strong class="dashboard-panel-card__value">${activeMembers.length}</strong>
        <p class="dashboard-panel-card__text">Registered account users available for tasks, notes, and messages.</p>
      </article>
      <article class="dashboard-panel-card">
        <img src="./assets/icons/user-profile.svg" data-theme-src-dark="./assets/icons/user-profile.svg" data-theme-src-light="./assets/icons/user-profile-light-theme.svg" alt="" class="dashboard-panel-card__icon" />
        <span class="dashboard-panel-card__label">Assigned roles</span>
        <strong class="dashboard-panel-card__value">${roleCount}</strong>
        <p class="dashboard-panel-card__text">Roles are prepared for backend permission handling.</p>
      </article>
    `;
    updateThemeAssets(stats);

    if (!members.length) {
      list.innerHTML = '<p class="task-empty">No team users yet. Sign up or connect backend users to populate this section.</p>';
      return;
    }

    list.innerHTML = members
      .map(
        (member) => `
          <article class="team-member-card">
            <span class="team-member-card__avatar" aria-hidden="true">${escapeHtml(getInitials(member.name))}</span>
            <div class="team-member-card__content">
              <strong>${escapeHtml(member.name)}</strong>
              <span>${escapeHtml(member.email || "No email saved")}</span>
            </div>
            <span class="status-badge status-badge--neutral">${escapeHtml(member.role || "Member")}</span>
            <span class="team-member-card__meta">${escapeHtml(member.department || "Workspace")} - joined ${formatDate(member.joinedAt)}</span>
          </article>
        `,
      )
      .join("");
    updateThemeAssets(list);
  };

  const renderRolesSection = () => {
    const list = document.querySelector(".js-team-roles-list");
    if (!list) return;

    const roles = getRoles();
    const members = getMembers();

    list.innerHTML = roles
      .map((role) => {
        const assignedCount = members.filter((member) => member.role === role.name).length;

        return `
          <article class="role-card">
            <div class="role-card__header">
              <img src="./assets/icons/user-profile.svg" data-theme-src-dark="./assets/icons/user-profile.svg" data-theme-src-light="./assets/icons/user-profile-light-theme.svg" alt="" class="dashboard-panel-card__icon" />
              <div>
                <span class="dashboard-panel-card__label">${escapeHtml(role.level)}</span>
                <strong class="role-card__title">${escapeHtml(role.name)}</strong>
              </div>
              <span class="status-badge status-badge--neutral">${assignedCount} assigned</span>
            </div>
            <ul class="role-card__permissions">
              ${(role.permissions || []).map((permission) => `<li>${escapeHtml(permission)}</li>`).join("")}
            </ul>
          </article>
        `;
      })
      .join("");
    updateThemeAssets(list);
  };

  const renderTeamSections = () => {
    renderUsersSection();
    renderRolesSection();
  };

  window.crmTeam = {
    getCurrentUser,
    getCurrentUserName,
    getMembers,
    getRoles,
    getAssignableMembers,
    renderTeamSections,
  };

  renderTeamSections();
  window.addEventListener("storage", renderTeamSections);
  window.addEventListener("crm:themechange", renderTeamSections);
})();
