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
// Type saved with the material, else guessed from the file name
export const typeOf = (m) => {
  const t = String(m.type || m.material_type || m.file_type || "").toLowerCase();
  if (t) return EXT_TYPE[t] || t;
  const name = String(m.file_name || m.original_name || m.originalName || m.file?.original_name || m.file_path || m.link || "");
  return EXT_TYPE[name.split(".").pop().toLowerCase()] || (m.link ? "video" : "");
};
export const linkOf = (m) => m.link || m.url || m.video_url || "";
export const uploaderName = (m) => {
  const u = pick(m, "uploaded_by", "uploadedBy", "uploader", "faculty");
  return (u && typeof u === "object" ? u.name || u.full_name : "") || "-";
};
export const uploaderId = (m) => relId(pick(m, "uploaded_by", "uploadedBy", "uploader", "faculty"));
export const sameText = (a, b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();