"use strict";

/* --- Shared Team Data Helpers --- */
(function initTeamHelpers() {
  const constants = window.crmConstants;
  const storage = window.crmStorage;
  const data = window.crmData;
  const toast = window.crmToast;

  if (!constants || !storage) return;

  /* --- Defaults keep roles and departments visible before backend data arrives. --- */
  const TEAM_MEMBERS_KEY = constants.TEAM_MEMBERS_KEY || "crm_team_members";
  const TEAM_ROLES_KEY = constants.TEAM_ROLES_KEY || "crm_team_roles";
  const defaultDepartments = ["Sales Team", "Support Team", "Management"];
  const defaultRoles = [
    {
      id: "owner",
      name: "Owner",
      level: "Full access",
      permissions: ["Manage account", "Invite users", "Manage clients", "Manage tasks", "View reports", "Export files"],
    },
    {
      id: "manager",
      name: "Manager",
      level: "Management access",
      permissions: ["Manage team workflow", "Manage clients", "Manage tasks", "View reports"],
    },
    {
      id: "sales",
      name: "Sales",
      level: "Sales access",
      permissions: ["Create clients", "Update sales tasks", "Add notes", "Use messenger"],
    },
    {
      id: "support",
      name: "Support",
      level: "Support access",
      permissions: ["View clients", "Update support tasks", "Add notes", "Use messenger"],
    },
  ];

  let apiMembers = [];
  let apiRoles = [];
  let apiDepartments = [];
  let canManageTeam = false;

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

  /* --- Session helpers connect team ownership to the signed-in user. --- */
  const getSession = () => {
    return storage.read(constants.SESSION_KEY, {}) || {};
  };

  const getUsers = () => readArray(constants.USERS_KEY);

  const getCurrentUser = () => {
    const session = getSession();
    const users = getUsers();
    const user = users.find((item) => item.id === session.userId || item.email === session.email);

    return user || session.user || null;
  };

  const getDisplayName = (user) => {
    return user?.fullName || user?.name || user?.email || "Account Owner";
  };

  const normalizeRoleName = (role = "") => {
    const roleText = String(role || "").trim().toLowerCase();
    if (roleText === "owner") return "Owner";
    if (roleText === "manager") return "Manager";
    if (roleText === "sales") return "Sales";
    if (roleText === "support") return "Support";
    return "Member";
  };

  const userCanManageLocally = () => normalizeRoleName(getCurrentUser()?.role) === "Owner";

  const getLocalMembers = () => {
    const users = getUsers();
    const extraMembers = readArray(TEAM_MEMBERS_KEY);
    const userMembers = users.map((user, index) => ({
      id: String(user.id || user.email || index),
      name: getDisplayName(user),
      email: user.email || "",
      role: normalizeRoleName(user.role || (index === 0 ? "owner" : "user")),
      department: user.department || user.company || "Workspace",
      status: "Active",
      joinedAt: user.createdAt || "",
      source: "account",
    }));

    return [...userMembers, ...extraMembers];
  };

  const uniqueMembers = (members) => {
    return members.filter((member, index, list) => {
      const key = String(member.email || member.id || member.name).toLowerCase();
      return key && list.findIndex((item) => String(item.email || item.id || item.name).toLowerCase() === key) === index;
    });
  };

  const getMembers = () => {
    const members = apiMembers.length ? apiMembers : getLocalMembers();
    const currentUser = getCurrentUser();

    if (!members.length && currentUser) {
      return [
        {
          id: String(currentUser.id || currentUser.email),
          name: getDisplayName(currentUser),
          email: currentUser.email || "",
          role: normalizeRoleName(currentUser.role || "owner"),
          department: currentUser.company || "Workspace",
          status: "Active",
          joinedAt: currentUser.createdAt || "",
          source: "account",
        },
      ];
    }

    return uniqueMembers(members);
  };

  const getRoles = () => {
    const savedRoles = readArray(TEAM_ROLES_KEY);
    return apiRoles.length ? apiRoles : savedRoles.length ? savedRoles : defaultRoles;
  };

  const getDepartments = () => {
    return apiDepartments.length ? apiDepartments : defaultDepartments;
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

  /* --- Modal creation keeps team-member add flow self-contained. --- */
  const ensureTeamModal = () => {
    let modal = document.getElementById("team-member-modal");
    if (modal) return modal;

    modal = document.createElement("section");
    modal.className = "modal";
    modal.id = "team-member-modal";
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="modal__dialog modal__dialog--small" role="dialog" aria-modal="true" aria-labelledby="team-member-modal-title">
        <header class="modal__header">
          <div>
            <p class="modal__eyebrow">Team access</p>
            <h2 class="modal__title" id="team-member-modal-title">Add Team Member</h2>
            <p class="modal__description">Create a pending team member record. Real email invitations can be connected later.</p>
          </div>
          <button class="modal__close" type="button" data-modal-close aria-label="Close team member modal">×</button>
        </header>
        <form class="modal__body modal__body--form js-team-member-form" novalidate>
          <label class="field" for="team-member-name">
            <span class="field__label">Full Name</span>
            <input class="input" id="team-member-name" name="fullName" type="text" autocomplete="name" required />
          </label>
          <label class="field" for="team-member-email">
            <span class="field__label">Email</span>
            <input class="input" id="team-member-email" name="email" type="email" autocomplete="email" required />
          </label>
          <label class="field" for="team-member-role">
            <span class="field__label">Role</span>
            <select class="input" id="team-member-role" name="role" required></select>
          </label>
          <label class="field" for="team-member-department">
            <span class="field__label">Department</span>
            <select class="input" id="team-member-department" name="department" required></select>
          </label>
          <p class="form-status js-team-member-error" hidden></p>
        </form>
        <footer class="modal__footer">
          <button class="btn btn--ghost" type="button" data-modal-close>Cancel</button>
          <button class="btn btn--primary js-team-member-submit" type="button">Add Member</button>
        </footer>
      </div>
    `;

    document.body.append(modal);
    modal.querySelector(".js-team-member-submit")?.addEventListener("click", () => {
      modal.querySelector(".js-team-member-form")?.requestSubmit();
    });

    return modal;
  };

  const populateTeamModalOptions = () => {
    const modal = ensureTeamModal();
    const roleSelect = modal.querySelector("#team-member-role");
    const departmentSelect = modal.querySelector("#team-member-department");
    const roles = getRoles().filter((role) => ["Manager", "Sales", "Support"].includes(role.name));

    if (roleSelect) {
      roleSelect.innerHTML = roles.map((role) => `<option value="${escapeHtml(role.name)}">${escapeHtml(role.name)}</option>`).join("");
    }

    if (departmentSelect) {
      departmentSelect.innerHTML = getDepartments()
        .map((department) => `<option value="${escapeHtml(department)}">${escapeHtml(department)}</option>`)
        .join("");
    }
  };

  const renderOwnerAction = () => {
    const usersHeader = document.querySelector('[data-dashboard-view="users"] .dashboard-section__header');
    if (!usersHeader) return;

    usersHeader.querySelector(".js-open-team-member-modal")?.remove();

    if (!canManageTeam) return;

    usersHeader.insertAdjacentHTML(
      "beforeend",
      `
        <button class="btn btn--primary js-open-team-member-modal" type="button" data-modal-target="team-member-modal">
          Add Team Member
        </button>
      `,
    );
  };

  const renderUsersSection = () => {
    const stats = document.querySelector(".js-team-users-stats");
    const list = document.querySelector(".js-team-users-list");
    if (!stats || !list) return;

    const members = getMembers();
    const activeMembers = members.filter((member) => member.status !== "Inactive");
    const roleCount = new Set(getRoles().map((role) => role.name).filter(Boolean)).size;

    stats.innerHTML = `
      <article class="dashboard-panel-card">
        <img src="./assets/icons/team.svg" data-theme-src-dark="./assets/icons/team.svg" data-theme-src-light="./assets/icons/team-light-mode.svg" alt="" class="dashboard-panel-card__icon" />
        <span class="dashboard-panel-card__label">Active users</span>
        <strong class="dashboard-panel-card__value">${activeMembers.length}</strong>
        <p class="dashboard-panel-card__text">Account users and owner-created team members available for tasks, notes, and messages.</p>
      </article>
      <article class="dashboard-panel-card">
        <img src="./assets/icons/user-profile.svg" data-theme-src-dark="./assets/icons/user-profile.svg" data-theme-src-light="./assets/icons/user-profile-light-theme.svg" alt="" class="dashboard-panel-card__icon" />
        <span class="dashboard-panel-card__label">Prepared roles</span>
        <strong class="dashboard-panel-card__value">${roleCount}</strong>
        <p class="dashboard-panel-card__text">Owner, Manager, Sales, and Support roles are ready for permission control.</p>
      </article>
    `;
    updateThemeAssets(stats);

    if (!members.length) {
      list.innerHTML = '<p class="task-empty">No team users yet. The owner can add team members here.</p>';
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
            <span class="status-badge status-badge--neutral">${escapeHtml(member.status || "Active")}</span>
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
    ensureTeamModal();
    populateTeamModalOptions();
    renderOwnerAction();
    renderUsersSection();
    renderRolesSection();
  };

  /* --- Backend sync upgrades local team data to account-scoped MongoDB records. --- */
  const loadTeamFromApi = async () => {
    if (!data?.fetchTeam || !data?.hasApiSession?.()) {
      canManageTeam = userCanManageLocally();
      renderTeamSections();
      return;
    }

    try {
      const team = await data.fetchTeam();
      apiMembers = Array.isArray(team.members) ? team.members : [];
      apiRoles = Array.isArray(team.roles) ? team.roles : [];
      apiDepartments = Array.isArray(team.departments) ? team.departments : [];
      canManageTeam = Boolean(team.canManageTeam);
    } catch (error) {
      canManageTeam = userCanManageLocally();
    }

    renderTeamSections();
  };

  const showFormError = (message) => {
    const error = document.querySelector(".js-team-member-error");
    if (!error) return;
    error.textContent = message;
    error.hidden = false;
  };

  document.addEventListener("submit", async (event) => {
    const form = event.target.closest(".js-team-member-form");
    if (!form) return;

    event.preventDefault();

    const formData = new FormData(form);
    const member = {
      fullName: String(formData.get("fullName") || "").trim(),
      email: String(formData.get("email") || "").trim().toLowerCase(),
      role: String(formData.get("role") || "").trim(),
      department: String(formData.get("department") || "").trim(),
      status: "Pending",
    };

    const error = form.querySelector(".js-team-member-error");
    if (error) error.hidden = true;

    if (!member.fullName || member.fullName.length < 2) {
      showFormError("Team member name must contain at least 2 characters.");
      return;
    }

    if (!/^\S+@\S+\.(com|net|org)$/i.test(member.email)) {
      showFormError("Enter a valid team member email ending with .com, .net, or .org.");
      return;
    }

    try {
      const savedMember = data?.postTeamMember ? await data.postTeamMember(member) : member;
      apiMembers = [savedMember, ...apiMembers];
      storage.write(TEAM_MEMBERS_KEY, [savedMember, ...readArray(TEAM_MEMBERS_KEY)]);
      form.reset();
      document.querySelector("#team-member-modal [data-modal-close]")?.click();
      renderTeamSections();
      toast?.show("Team member added as pending.", "success");
    } catch (teamError) {
      showFormError(teamError.message || "Team member could not be added.");
      toast?.show(teamError.message || "Team member could not be added.", "error");
    }
  });

  window.crmTeam = {
    getCurrentUser,
    getCurrentUserName,
    getMembers,
    getRoles,
    getDepartments,
    getAssignableMembers,
    renderTeamSections,
    loadTeamFromApi,
  };

  loadTeamFromApi();
  window.addEventListener("storage", renderTeamSections);
  window.addEventListener("crm:themechange", renderTeamSections);
})();
