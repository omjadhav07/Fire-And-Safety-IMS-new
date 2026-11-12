// import api from "../../services/api";

// const unwrap = (data) => data?.data ?? data;

// // GET /notices?page=1&limit=20  ->  { list, totalPages }
// export const getNotices = async ({ page = 1, limit = 20 } = {}) => {
//   const { data } = await api.get("/notices", { params: { page, limit } });
//   const payload = unwrap(data);
//   const list = Array.isArray(payload)
//     ? payload
//     : payload?.notices || payload?.items || payload?.rows || [];
//   const meta = data?.meta || data?.pagination || payload?.meta || payload?.pagination || {};
//   const total = meta.total ?? meta.totalItems ?? payload?.total;
//   const totalPages = meta.totalPages ?? meta.pages ?? (total ? Math.ceil(total / limit) : null);
//   return { list, totalPages };
// };

// // GET /notices/:id
// export const getNoticeById = async (id) => {
//   const { data } = await api.get(`/notices/${id}`);
//   const payload = unwrap(data);
//   return payload?.notice ?? payload;
// };

// // POST /notices
// //  all:    { title, description, targetType: "all" }
// //  course: { title, description, targetType: "course", targetCourse }
// //  batch:  { title, description, targetType: "batch",  targetBatch }
// export const createNotice = async (body) => {
//   const { data } = await api.post("/notices", body);
//   const payload = unwrap(data);
//   return payload?.notice ?? payload;
// };

// // PUT /notices/:id  { title, description }
// export const updateNotice = async (id, body) => {
//   const { data } = await api.put(`/notices/${id}`, body);
//   return unwrap(data);
// };

// // PUT /notices/:id  { status: "published" }
// export const publishNotice = async (id) => {
//   const { data } = await api.put(`/notices/${id}`, { status: "published" });
//   return unwrap(data);
// };

// // PUT /notices/:id/status  { status: "withdrawn" }
// export const withdrawNotice = async (id) => {
//   const { data } = await api.put(`/notices/${id}/status`, { status: "withdrawn" });
//   return unwrap(data);
// };

// // DELETE /notices/:id
// export const deleteNotice = async (id) => {
//   const { data } = await api.delete(`/notices/${id}`);
//   return unwrap(data);
// };


import api from "../../services/api";

const unwrap = (data) => data?.data ?? data;

// GET /notices?page=1&limit=20
// Response: { list, totalPages }
export const getNotices = async ({ page = 1, limit = 20 } = {}) => {
  const { data } = await api.get("/notices", {
    params: { page, limit }
  });

  const payload = unwrap(data);

  const list = Array.isArray(payload)
    ? payload
    : payload?.notices || payload?.items || payload?.rows || [];

  const meta =
    data?.meta ||
    data?.pagination ||
    payload?.meta ||
    payload?.pagination ||
    {};

  const total = meta.total ?? meta.totalItems ?? payload?.total;

  const totalPages =
    meta.totalPages ??
    meta.pages ??
    (total ? Math.ceil(total / limit) : null);

  return { list, totalPages };
};

// GET /notices/:id
export const getNoticeById = async (id) => {
  const { data } = await api.get(`/notices/${id}`);

  const payload = unwrap(data);

  return payload?.notice ?? payload;
};

// POST /notices
// All:    { title, description, targetType: "all" }
// Course: { title, description, targetType: "course", targetCourse }
// Batch:  { title, description, targetType: "batch", targetBatch }
export const createNotice = async (body) => {
  const { data } = await api.post("/notices", body);

  const payload = unwrap(data);

  return payload?.notice ?? payload;
};

// PUT /notices/:id
// Update notice details
export const updateNotice = async (id, body) => {
  const { data } = await api.put(`/notices/${id}`, body);

  return unwrap(data);
};

// PUT /notices/:id/status
// Publish notice
export const publishNotice = async (id) => {
  const { data } = await api.put(`/notices/${id}/status`, {
    status: "published"
  });

  return unwrap(data);
};

// PUT /notices/:id/status
// Withdraw notice
export const withdrawNotice = async (id) => {
  const { data } = await api.put(`/notices/${id}/status`, {
    status: "withdrawn"
  });

  return unwrap(data);
};

// DELETE /notices/:id
export const deleteNotice = async (id) => {
  const { data } = await api.delete(`/notices/${id}`);

  return unwrap(data);
};