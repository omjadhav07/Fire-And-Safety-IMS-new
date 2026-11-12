// import api from "../../services/api";

// const unwrapList = (data) => {
//   const payload = data?.data ?? data;
//   if (Array.isArray(payload)) return payload;
//   for (const k of ["materials", "items", "rows", "results"]) if (Array.isArray(payload?.[k])) return payload[k];
//   return [];
// };

// // Students use their own endpoints (only published material of their batch comes back)
// const base = (student) => (student ? "/student/materials" : "/materials");

// // GET /materials   (students: GET /student/materials)
// export const getMaterials = async ({ student = false, ...params } = {}) => {
//   const { data } = await api.get(base(student), { params });
//   return unwrapList(data);
// };

// // GET /materials/:id
// export const getMaterialById = async (id) => {
//   const { data } = await api.get(`/materials/${id}`);
//   return data?.data?.material ?? data?.data ?? data;
// };

// // Values go as multipart/form-data when a file is attached, plain JSON otherwise
// const toBody = (values, file) => {
//   if (!file) return values;
//   const fd = new FormData();
//   Object.entries(values).forEach(([k, v]) => v !== undefined && v !== null && v !== "" && fd.append(k, v));
//   fd.append("file", file);
//   return fd;
// };
// const cfg = (file) => (file ? { headers: { "Content-Type": "multipart/form-data" }, timeout: 120000 } : {});

// // POST /materials   { course_id, batch_id, subject, topic, title, description, type, status, file | link }
// export const createMaterial = async (values, file) => {
//   const { data } = await api.post("/materials", toBody(values, file), cfg(file));
//   return data?.data ?? data;
// };

// // PUT /materials/:id   (file optional: replaces the stored file)
// export const updateMaterial = async (id, values, file) => {
//   const { data } = await api.put(`/materials/${id}`, toBody(values, file), cfg(file));
//   return data?.data ?? data;
// };

// // PUT /materials/:id/status   { status: "draft" | "published" }
// export const setMaterialStatus = async (id, status) => {
//   const { data } = await api.put(`/materials/${id}/status`, { status });
//   return data?.data ?? data;
// };

// // DELETE /materials/:id
// export const deleteMaterial = async (id) => {
//   const { data } = await api.delete(`/materials/${id}`);
//   return data?.data ?? data;
// };

// // GET /materials/:id/download  (students: /student/materials/:id/download)
// // Needs the Bearer token, so it is fetched as a blob. mode "view" opens it in a new tab, "download" saves it.
// export const openMaterialFile = async (id, { student = false, mode = "download", fallbackName = "material" } = {}) => {
//   const res = await api.get(`${base(student)}/${id}/download`, { responseType: "blob", timeout: 120000 });
//   const url = window.URL.createObjectURL(res.data);

//   if (mode === "view") {
//     window.open(url, "_blank", "noopener");
//     setTimeout(() => window.URL.revokeObjectURL(url), 60000);
//     return;
//   }
//   const disposition = res.headers?.["content-disposition"] || "";
//   const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = match ? decodeURIComponent(match[1]) : fallbackName;
//   document.body.appendChild(a);
//   a.click();
//   a.remove();
//   window.URL.revokeObjectURL(url);
// };



import api from "../../services/api";
import { uploadFile } from "../files/uploadService";

const getId = (o) => (o && typeof o === "object" ? o.id || o._id : o) || "";

const unwrapList = (data) => {
  const payload = data?.data ?? data;
  if (Array.isArray(payload)) return payload;
  for (const k of ["materials", "items", "rows", "results"]) if (Array.isArray(payload?.[k])) return payload[k];
  return [];
};

// Students use their own endpoints (only published material of their batch comes back)
const base = (student) => (student ? "/student/materials" : "/materials");

// GET /materials   (students: GET /student/materials)
export const getMaterials = async ({ student = false, ...params } = {}) => {
  const { data } = await api.get(base(student), { params });
  return unwrapList(data);
};

// GET /materials/:id
export const getMaterialById = async (id) => {
  const { data } = await api.get(`/materials/${id}`);
  return data?.data?.material ?? data?.data ?? data;
};

// The file is uploaded first (POST /uploads) and the material only carries its id:
// POST /materials  { title, description, course_id, batch_id, subject, topic, upload_id }
const withUpload = async (values, file) => {
  if (!file) return values;
  const up = await uploadFile(file);
  const uploadId = getId(up?.upload) || getId(up?.file) || getId(up);
  if (!uploadId) throw new Error("Upload succeeded but no file id was returned");
  return { ...values, upload_id: uploadId };
};

export const createMaterial = async (values, file) => {
  const { data } = await api.post("/materials", await withUpload(values, file));
  return data?.data?.material ?? data?.data ?? data;
};

// PUT /materials/:id   (a new file is uploaded first and replaces the old one through upload_id)
export const updateMaterial = async (id, values, file) => {
  const { data } = await api.put(`/materials/${id}`, await withUpload(values, file));
  return data?.data?.material ?? data?.data ?? data;
};

// PUT /materials/:id/status   { status: "draft" | "published" }
export const setMaterialStatus = async (id, status) => {
  const { data } = await api.put(`/materials/${id}/status`, { status });
  return data?.data ?? data;
};

// DELETE /materials/:id
export const deleteMaterial = async (id) => {
  const { data } = await api.delete(`/materials/${id}`);
  return data?.data ?? data;
};

// GET /materials/:id/download  (students: /student/materials/:id/download)
// Needs the Bearer token, so it is fetched as a blob. mode "view" opens it in a new tab, "download" saves it.
export const openMaterialFile = async (id, { student = false, mode = "download", fallbackName = "material" } = {}) => {
  const res = await api.get(`${base(student)}/${id}/download`, { responseType: "blob", timeout: 120000 });
  const url = window.URL.createObjectURL(res.data);

  if (mode === "view") {
    window.open(url, "_blank", "noopener");
    setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    return;
  }
  const disposition = res.headers?.["content-disposition"] || "";
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  const a = document.createElement("a");
  a.href = url;
  a.download = match ? decodeURIComponent(match[1]) : fallbackName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};