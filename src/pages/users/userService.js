import api from "../../services/api";

// GET /users
export const getUsers = async (params = {}) => {
  const { data } = await api.get("/users", { params });
  const payload = data?.data ?? data;
  // list may be the array itself, or { users: [...] } / { items: [...] }
  const list = Array.isArray(payload)
    ? payload
    : payload?.users || payload?.items || payload?.rows || [];
  return { list, meta: data?.meta };
};

// POST /users  { name, email, password, role, phone }
export const createUser = async (body) => {
  const { data } = await api.post("/users", body);
  return data?.data ?? data;
};

// PUT /users/:id  { name, phone }
export const updateUser = async (id, body) => {
  const { data } = await api.put(`/users/${id}`, body);
  return data?.data ?? data;
};

// PATCH /users/:id/status  (activate / deactivate)
export const setUserStatus = async (id, isActive) => {
  const { data } = await api.patch(`/users/${id}/status`, { is_active: isActive });
  return data?.data ?? data;
};

// POST /users/:id/reset-password  { password }  (admin sets a temporary password)
export const adminResetPassword = async (id, password) => {
  const { data } = await api.post(`/users/${id}/reset-password`, { password });
  return data?.data ?? data;
};
