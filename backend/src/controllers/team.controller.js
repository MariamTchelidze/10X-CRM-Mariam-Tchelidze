import { TeamMember } from "../models/TeamMember.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sanitizeString } from "../utils/sanitize.js";

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

const defaultDepartments = ["Sales Team", "Support Team", "Management"];

const buildMemberResponse = (member) => ({
  id: member._id.toString(),
  name: member.fullName,
  fullName: member.fullName,
  email: member.email,
  role: member.role,
  department: member.department,
  status: member.status,
  joinedAt: member.createdAt,
  source: "invite",
});

const formatUserRole = (role = "") => {
  const roleText = String(role).trim().toLowerCase();
  if (roleText === "owner") return "Owner";
  if (roleText === "manager") return "Manager";
  if (roleText === "sales") return "Sales";
  if (roleText === "support") return "Support";
  return "Member";
};

const buildAccountMember = (user) => ({
  id: user._id.toString(),
  name: user.fullName,
  fullName: user.fullName,
  email: user.email,
  role: formatUserRole(user.role),
  department: user.company || "Workspace",
  status: "Active",
  joinedAt: user.createdAt,
  source: "account",
});

export const getTeam = asyncHandler(async (request, response) => {
  const invitedMembers = await TeamMember.find({ owner: request.user._id }).sort({ createdAt: -1 });
  const members = [buildAccountMember(request.user), ...invitedMembers.map(buildMemberResponse)];

  response.status(200).json({
    status: "success",
    canManageTeam: request.user.role === "owner",
    departments: defaultDepartments,
    roles: defaultRoles,
    members,
  });
});

export const createTeamMember = asyncHandler(async (request, response) => {
  if (request.user.role !== "owner") {
    throw new ApiError(403, "Only the account owner can add team members.");
  }

  const email = sanitizeString(request.body.email).toLowerCase();
  const existingMember = await TeamMember.findOne({ owner: request.user._id, email });

  if (existingMember) {
    throw new ApiError(409, "A team member with this email already exists.");
  }

  const member = await TeamMember.create({
    owner: request.user._id,
    fullName: sanitizeString(request.body.fullName),
    email,
    role: request.body.role,
    department: request.body.department,
    status: request.body.status === "Active" ? "Active" : "Pending",
  });

  response.status(201).json({
    status: "success",
    member: buildMemberResponse(member),
  });
});
