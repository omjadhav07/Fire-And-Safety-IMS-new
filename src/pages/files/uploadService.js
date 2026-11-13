import api from "../../services/api";

const unwrapList = (data) => {
  const payload = data?.data ?? data;
  if (Array.isArray(payload)) return payload;
  for (const k of ["files", "uploads", "items", "rows"]) if (Array.isArray(payload?.[k])) return payload[k];
  return [];
};

// POST /uploads  (multipart/form-data, field name: "file")
export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/uploads", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return data?.data ?? data;
};

// POST /uploads/videos  (multipart/form-data, field name: "file") - lecture videos, longer timeout for big files
export const uploadVideo = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/uploads/videos", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 600000,
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return data?.data ?? data;
};

// GET /uploads  (files uploaded by the logged-in user)
export const getMyFiles = async (params = {}) => {
  const { data } = await api.get("/uploads", { params });
  return unwrapList(data);
};

// GET /uploads/:id/download  (needs the Bearer token, so fetch as a blob and save it)
export const downloadFile = async (id, fallbackName = "download") => {
  const res = await api.get(`/uploads/${id}/download`, { responseType: "blob", timeout: 120000 });

  // Prefer the file name sent by the server
  const disposition = res.headers?.["content-disposition"] || "";
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  const name = match ? decodeURIComponent(match[1]) : fallbackName;

  const url = window.URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

// PUT /uploads/:id  (multipart/form-data, field name: "file") - replaces the stored file
export const replaceFile = async (id, file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.put(`/uploads/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return data?.data ?? data;
};

// DELETE /uploads/:id
export const deleteFile = async (id) => {
  const { data } = await api.delete(`/uploads/${id}`);
  return data?.data ?? data;
};
