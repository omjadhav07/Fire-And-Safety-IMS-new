// import api from "../../services/api";

// const unwrap = (data) => data?.data ?? data;

// // GET /rbac/permissions  ->  { Courses: [{ _id, code, module, description }], Exams: [...], ... }  (grouped by module)
// export const getPermissions = async () => {
//   const { data } = await api.get("/rbac/permissions");
//   const payload = unwrap(data);
//   return payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
// };

// // GET /rbac/roles  ->  [{ _id, name, description, isSystem, permissions: [{ _id, code }] }]
// export const getRoles = async () => {
//   const { data } = await api.get("/rbac/roles");
//   const payload = unwrap(data);
//   return Array.isArray(payload) ? payload : payload?.roles || payload?.items || [];
// };

// // POST /rbac/roles  { name, description }   (custom role, starts with no permissions)
// export const createRole = async ({ name, description }) => {
//   const { data } = await api.post("/rbac/roles", { name, description });
//   return unwrap(data);
// };

// // DELETE /rbac/roles/:roleId   (custom roles only)
// export const deleteRole = async (roleId) => {
//   const { data } = await api.delete(`/rbac/roles/${roleId}`);
//   return unwrap(data);
// };

// // PUT /rbac/roles/:roleId/permissions  { permissions: [permissionId, ...] }  (replaces the role's permission list)
// // If your API expects another key (for example "permissionIds" or permission codes), change it here only.
// export const updateRolePermissions = async (roleId, permissionIds) => {
//   const { data } = await api.put(`/rbac/roles/${roleId}/permissions`, { permissions: permissionIds });
//   return unwrap(data);
// };




// import api from "../../services/api";

// const unwrap = (data) => data?.data ?? data;

// // GET /rbac/permissions
// export const getPermissions = async () => {
//   const { data } = await api.get("/rbac/permissions");
//   const payload = unwrap(data);
//   return payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
// };

// // GET /rbac/roles
// export const getRoles = async () => {
//   const { data } = await api.get("/rbac/roles");
//   const payload = unwrap(data);
//   return Array.isArray(payload) ? payload : payload?.roles || payload?.items || [];
// };

// // POST /rbac/roles
// export const createRole = async ({ name, description }) => {
//   const { data } = await api.post("/rbac/roles", { name, description });
//   return unwrap(data);
// };

// // DELETE /rbac/roles/:roleId
// export const deleteRole = async (roleId) => {
//   const { data } = await api.delete(`/rbac/roles/${roleId}`);
//   return unwrap(data);
// };

// // PUT /rbac/roles/:roleId/permissions 
// export const updateRolePermissions = async (roleId, permissionIds) => {
//   // 🚨 FIXED: Sending "permissionIds" instead of "permissions"
//   const { data } = await api.put(`/rbac/roles/${roleId}/permissions`, { permissionIds: permissionIds });
//   return unwrap(data);
// };


// 16 nov

import api from "../../services/api";

const unwrap = (data) => data?.data ?? data;

// GET /rbac/permissions
export const getPermissions = async () => {
  const { data } = await api.get("/rbac/permissions");
  const payload = unwrap(data);
  return payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
};

// GET /rbac/roles
export const getRoles = async () => {
  const { data } = await api.get("/rbac/roles");
  const payload = unwrap(data);
  return Array.isArray(payload) ? payload : payload?.roles || payload?.items || [];
};

// POST /rbac/roles
export const createRole = async ({ name, description }) => {
  const { data } = await api.post("/rbac/roles", { name, description });
  return unwrap(data);
};

// DELETE /rbac/roles/:roleId
export const deleteRole = async (roleId) => {
  const { data } = await api.delete(`/rbac/roles/${roleId}`);
  return unwrap(data);
};

// PUT /rbac/roles/:roleId/permissions 
export const updateRolePermissions = async (roleId, permissionIds) => {
  // 🚨 FIXED: Sending "permissionIds" instead of "permissions"
  const { data } = await api.put(`/rbac/roles/${roleId}/permissions`, { permissionIds: permissionIds });
  return unwrap(data);
};

/* ───── User-wise permissions ───── */

const listOfCodes = (v) => (Array.isArray(v) ? v : []);

// GET /rbac/users/:userId/permissions
// -> { user, role_permissions, extra_permissions, denied_permissions, effective_permissions }
export const getUserPermissions = async (userId) => {
  const { data } = await api.get(`/rbac/users/${userId}/permissions`);
  const p = unwrap(data) || {};
  return {
    user: p.user || null,
    role: listOfCodes(p.role_permissions),
    extra: listOfCodes(p.extra_permissions),
    denied: listOfCodes(p.denied_permissions),
    effective: listOfCodes(p.effective_permissions),
  };
};

// PUT /rbac/users/:userId/permissions   { denied: [permissionId], extra?: [permissionId] }
// denied = permissions of the role that are switched off for this user
// extra  = permissions the role does not have but this user gets (only sent when there are any)
export const saveUserPermissions = async (userId, { denied = [], extra = [] }) => {
  const body = { denied };
  if (extra.length) body.extra = extra;
  const { data } = await api.put(`/rbac/users/${userId}/permissions`, body);
  return { message: data?.message, effective: listOfCodes(unwrap(data)?.effective_permissions) };
};

// DELETE /rbac/users/:userId/permissions   (back to the role defaults)
export const resetUserPermissions = async (userId) => {
  const { data } = await api.delete(`/rbac/users/${userId}/permissions`);
  return data?.message;
};