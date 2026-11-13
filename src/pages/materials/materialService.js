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
import { uploadFile, uploadVideo } from "../files/uploadService";

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

// The file is uploaded first and the material only carries its id:
//   documents (pdf/ppt/pptx/doc/docx...) -> POST /uploads
//   videos                               -> POST /uploads/videos
// POST /materials  { title, description, course_id, batch_id, subject, topic, upload_id }
const isVideoFile = (file) => /^video\//i.test(file.type || "") || /\.(mp4|mov|webm|mkv|avi)$/i.test(file.name || "");

const withUpload = async (values, file, onProgress) => {
  if (!file) return values;
  const up = await (isVideoFile(file) ? uploadVideo : uploadFile)(file, onProgress);
  const uploadId = getId(up?.upload) || getId(up?.file) || getId(up);
  if (!uploadId) throw new Error("Upload succeeded but no file id was returned");
  return { ...values, upload_id: uploadId };
};

export const createMaterial = async (values, file, onProgress) => {
  const { data } = await api.post("/materials", await withUpload(values, file, onProgress));
  return data?.data?.material ?? data?.data ?? data;
};

// PUT /materials/:id   (a new file is uploaded first and replaces the old one through upload_id)
export const updateMaterial = async (id, values, file, onProgress) => {
  const { data } = await api.put(`/materials/${id}`, await withUpload(values, file, onProgress));
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

// Errors of a blob request come back as a Blob; turn them into JSON so getErrorMessage shows the server's message
const readBlobError = async (err) => {
  const blob = err?.response?.data;
  if (blob instanceof Blob) {
    try {
      err.response.data = JSON.parse(await blob.text());
    } catch {
      /* not JSON, keep as is */
    }
  }
  throw err;
};

// Documents:  View GET /materials/:id/view (PDF only)  |  Download GET /materials/:id/download
// Videos:     the document endpoints answer 404 / 415, so GET /materials/:id/stream is used instead
//             (students: /student/materials/:id/...)
const videoPath = (root) => `${root}/stream`;

const fetchBlob = (path) => api.get(path, { responseType: "blob", timeout: 600000 }).catch(readBlobError);
const errText = (err) => String(err?.response?.data?.message || "");

const saveBlob = (blob, res, fallbackName) => {
  const disposition = res.headers?.["content-disposition"] || "";
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = match ? decodeURIComponent(match[1]) : fallbackName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

// Needs the Bearer token, so the file is fetched as a blob.
//   mode "download" -> saves the file                         returns { kind: "download" }
//   mode "view"     -> PDF opens in a new tab                 returns { kind: "pdf" }
//                      video returns a blob url to play       returns { kind: "video", url }  (caller revokes it)
//                      PPT / DOC cannot be previewed -> downloaded instead
export const openMaterialFile = async (id, { student = false, mode = "download", fallbackName = "material" } = {}) => {
  const root = `${base(student)}/${id}`;
  let res;
  let isVideo = false;
  try {
    res = await fetchBlob(`${root}/${mode === "view" ? "view" : "download"}`);
  } catch (err) {
    const status = err?.response?.status;
    if (mode === "view" && status === 415 && /pdf/i.test(errText(err))) {
      return openMaterialFile(id, { student, mode: "download", fallbackName });
    }
    if (![404, 415].includes(status)) throw err;
    isVideo = true;
    res = await fetchBlob(videoPath(root));
  }

  if (mode !== "view") {
    saveBlob(res.data, res, fallbackName);
    return { kind: "download" };
  }

  if (isVideo) {
    const blob = String(res.data.type).startsWith("video/") ? res.data : new Blob([res.data], { type: "video/mp4" });
    return { kind: "video", url: window.URL.createObjectURL(blob) };
  }

  const blob = String(res.data.type).includes("pdf") ? res.data : new Blob([res.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener");
  setTimeout(() => window.URL.revokeObjectURL(url), 10 * 60000);
  return { kind: "pdf" };
};
