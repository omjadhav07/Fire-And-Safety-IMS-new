

// Enquiry sources offered in the form. The API doc only shows "walk-in" - edit to match your backend.
export const SOURCES = ["walk-in", "phone", "website", "referral", "social-media", "other"];
export const GENDERS = ["male", "female", "other"];

export const STATUS_STYLES = {
  new: "bg-blue-100 text-blue-700",
  converted: "bg-emerald-100 text-emerald-700",
};
export const statusClass = (s) => STATUS_STYLES[s] || "bg-gray-100 text-gray-600";

export const emptyEnquiry = { name: "", phone: "", email: "", address: "", course_interest_id: "", source: "walk-in", notes: "" };
export const emptyConvert = { dob: "", gender: "", qualification: "", address: "", guardian_name: "", guardian_phone: "" };

export const relName = (v, map) => (v && typeof v === "object" ? v.name : map[v]) || "-";
