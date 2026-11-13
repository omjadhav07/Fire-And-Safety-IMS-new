// import { pick, relId } from "../schedules/scheduleUtils";

// export const MATERIAL_TYPES = [
//   ["pdf", "PDF"],
//   ["ppt", "PPT"],
//   ["doc", "Doc"],
//   ["notes", "Notes"],
//   ["video", "Video"],
// ];
// export const typeLabel = (t) => MATERIAL_TYPES.find(([v]) => v === String(t || "").toLowerCase())?.[1] || (t ? String(t).toUpperCase() : "-");

// export const STATUSES = ["draft", "published"];

// export const emptyMaterial = {
//   title: "",
//   description: "",
//   course_id: "",
//   batch_id: "",
//   subject: "",
//   type: "pdf",
//   link: "",
//   status: "published",
// };

// export const getId = (m) => m?.id || m?._id || "";
// export const courseOf = (m) => relId(pick(m, "course_id", "course"));
// export const batchOf = (m) => relId(pick(m, "batch_id", "batch"));
// export const statusOf = (m) => {
//   const s = String(m.status || "").toLowerCase();
//   if (s === "published" || s === "draft") return s;
//   if (typeof m.is_published === "boolean") return m.is_published ? "published" : "draft";
//   return s === "archived" ? "draft" : "published";
// };
// export const typeOf = (m) => String(m.type || m.material_type || m.file_type || "").toLowerCase();
// export const linkOf = (m) => m.link || m.url || m.video_url || "";
// export const uploaderName = (m) => {
//   const u = pick(m, "uploaded_by", "uploadedBy", "uploader", "faculty");
//   return (u && typeof u === "object" ? u.name || u.full_name : "") || "-";
// };
// export const uploaderId = (m) => relId(pick(m, "uploaded_by", "uploadedBy", "uploader", "faculty"));
// export const sameText = (a, b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();


import { pick, relId } from "../schedules/scheduleUtils";

export const MATERIAL_TYPES = [
  ["pdf", "PDF"],
  ["ppt", "PPT"],
  ["doc", "Doc"],
  ["notes", "Notes"],
  ["video", "Video"],
];
export const typeLabel = (t) => MATERIAL_TYPES.find(([v]) => v === String(t || "").toLowerCase())?.[1] || (t ? String(t).toUpperCase() : "-");

export const STATUSES = ["draft", "published"];

export const emptyMaterial = {
  title: "",
  description: "",
  course_id: "",
  batch_id: "",
  subject: "",
  type: "pdf",
  link: "",
  status: "published",
};

export const getId = (m) => m?.id || m?._id || "";
export const courseOf = (m) => relId(pick(m, "course_id", "course"));
export const batchOf = (m) => relId(pick(m, "batch_id", "batch"));
export const statusOf = (m) => {
  const s = String(m.status || "").toLowerCase();
  if (s === "published" || s === "draft") return s;
  if (typeof m.is_published === "boolean") return m.is_published ? "published" : "draft";
  return s === "archived" ? "draft" : "published";
};
const EXT_TYPE = { pdf: "pdf", ppt: "ppt", pptx: "ppt", doc: "doc", docx: "doc", txt: "notes", mp4: "video", mov: "video", webm: "video" };
const mimeType = (mime) => {
  const x = String(mime || "").toLowerCase();
  if (x.startsWith("video/")) return "video";
  if (x.includes("pdf")) return "pdf";
  if (x.includes("presentation") || x.includes("powerpoint")) return "ppt";
  if (x.includes("word")) return "doc";
  if (x.startsWith("text/")) return "notes";
  return "";
};

// Type saved with the material, else read from the uploaded file (mime type / file name)
export const typeOf = (m) => {
  const up = (m.upload_id && typeof m.upload_id === "object" ? m.upload_id : m.upload || m.file || m.video) || {};
  const t = String(m.type || m.material_type || m.file_type || "").toLowerCase();
  if (t) return EXT_TYPE[t] || mimeType(t) || t;
  const byMime = mimeType(m.mime_type || m.mimeType || up.mime_type || up.mimeType || up.mimetype);
  if (byMime) return byMime;
  const name = String(
    m.file_name || m.original_name || m.originalName || up.original_name || up.originalName || up.file_name || up.filename ||
      m.file_path || up.file_path || m.link || ""
  );
  return EXT_TYPE[name.split(".").pop().toLowerCase()] || (m.link || m.video_url || up.video_url ? "video" : "");
};
export const linkOf = (m) => m.link || m.url || m.video_url || "";
export const uploaderName = (m) => {
  const u = pick(m, "uploaded_by", "uploadedBy", "uploader", "faculty");
  return (u && typeof u === "object" ? u.name || u.full_name : "") || "-";
};
export const uploaderId = (m) => relId(pick(m, "uploaded_by", "uploadedBy", "uploader", "faculty"));
export const sameText = (a, b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();