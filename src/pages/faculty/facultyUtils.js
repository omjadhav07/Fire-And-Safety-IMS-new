export const initialForm = { faculty_id: "", course_id: "", batch_id: "", subject: "" };

export const roleOf = (u) => (typeof u.role === "string" ? u.role : u.role?.name || u.roles?.[0]?.name || "");

// An assignment field may come back as an id or as a populated object, under several key names
export const pick = (a, ...keys) => {
  for (const k of keys) if (a[k] !== undefined && a[k] !== null) return a[k];
  return undefined;
};

// FIXED: Check for `_id` first, then `id`
export const relId = (v) => (v && typeof v === "object" ? v._id || v.id : v) || "";

// FIXED: Check for `name` or `title`
export const relName = (v, map) => (v && typeof v === "object" ? v.name || v.title : map[v]) || "";