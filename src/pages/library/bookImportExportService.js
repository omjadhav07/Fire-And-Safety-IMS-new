import api from "../../services/api";

const BASE = "/import-export/library/books";

// Blob responses hide the JSON error body inside a Blob - unwrap it so getErrorMessage() works
export const unwrapBlobError = async (err) => {
  const body = err?.response?.data;
  if (body instanceof Blob) {
    try {
      err.response.data = JSON.parse(await body.text());
    } catch {
      /* not JSON, keep the original error */
    }
  }
  return err;
};

export const saveBlob = (res, fallbackName) => {
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

const download = async (path, format, fallbackName) => {
  try {
    const res = await api.get(`${BASE}/${path}`, { params: { format }, responseType: "blob", timeout: 120000 });
    saveBlob(res, `${fallbackName}.${format}`);
  } catch (err) {
    throw await unwrapBlobError(err);
  }
};

// GET /import-export/library/books/export?format=xlsx|csv
export const exportBooks = (format = "xlsx") => download("export", format, "library-books");

// GET /import-export/library/books/template?format=xlsx|csv
export const downloadBookTemplate = (format = "xlsx") => download("template", format, "book-import-template");

// POST /import-export/library/books/import  (multipart/form-data, field name: "file")
export const importBooks = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post(`${BASE}/import`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 180000,
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return data;
};