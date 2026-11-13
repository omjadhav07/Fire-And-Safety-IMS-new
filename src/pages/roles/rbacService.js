import api from "../../services/api";

const unwrap = (data) => data?.data ?? data;

// GET /rbac/permissions  ->  { Courses: [{ _id, code, module, description }], Exams: [...], ... }  (grouped by module)
export const getPermissions = async () => {
  const { data } = await api.get("/rbac/permissions");
  const payload = unwrap(data);
  return payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
};

// GET /rbac/roles  ->  [{ _id, name, description, isSystem, permissions: [{ _id, code }] }]
export const getRoles = async () => {
  const { data } = await api.get("/rbac/roles");
  const payload = unwrap(data);
  return Array.isArray(payload) ? payload : payload?.roles || payload?.items || [];
};

// POST /rbac/roles  { name, description }   (custom role, starts with no permissions)
export const createRole = async ({ name, description }) => {
  const { data } = await api.post("/rbac/roles", { name, description });
  return unwrap(data);
};

// DELETE /rbac/roles/:roleId   (custom roles only)
export const deleteRole = async (roleId) => {
  const { data } = await api.delete(`/rbac/roles/${roleId}`);
  return unwrap(data);
};

// PUT /rbac/roles/:roleId/permissions  { permissions: [permissionId, ...] }  (replaces the role's permission list)
// If your API expects another key (for example "permissionIds" or permission codes), change it here only.
export const updateRolePermissions = async (roleId, permissionIds) => {
  const { data } = await api.put(`/rbac/roles/${roleId}/permissions`, { permissions: permissionIds });
  return unwrap(data);
};
