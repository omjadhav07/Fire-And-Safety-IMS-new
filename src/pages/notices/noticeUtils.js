

export const LIMIT = 20;

export const STATUS_STYLES = {
  draft: "bg-gray-100 text-gray-600",
  published: "bg-emerald-100 text-emerald-700",
  withdrawn: "bg-amber-100 text-amber-700",
};
export const statusClass = (s) => STATUS_STYLES[String(s || "").toLowerCase()] || "bg-gray-100 text-gray-600";

export const TARGET_TYPES = [
  { value: "all", label: "Everyone" },
  { value: "course", label: "A course" },
  { value: "batch", label: "A batch" },
];

export const initialForm = { title: "", description: "", targetType: "all", courseId: "", batchId: "", publishNow: false };
