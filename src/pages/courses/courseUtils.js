

export const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/40 focus:border-[#16A34A]";

export const initialForm = { name: "", duration: "", description: "" };
export const getId = (c) => c.id || c._id;
export const isActive = (c) => (c.status ? c.status === "active" : c.is_active ?? true);
