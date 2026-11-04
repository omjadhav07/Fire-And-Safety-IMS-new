// Stages and statuses offered in the form. The API doc shows "admission" -> "documents"
// and "pending" / "in_progress"; edit these lists if your backend uses other values.
export const LIFECYCLE_STAGES = ["admission", "documents", "fees", "training", "exam", "certification", "completed"];
export const STAGE_STATUSES = ["pending", "in_progress", "completed"];

const STAGE_STATUS_STYLES = {
  pending: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};
export const stageStatusClass = (s) => STAGE_STATUS_STYLES[s] || "bg-gray-100 text-gray-600";

/* ───── Student list / form constants ───── */

export const STATUSES = ["active", "completed", "left"];
export const GENDERS = ["male", "female", "other"];

export const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  left: "bg-gray-200 text-gray-600",
};
export const statusClass = (s) => STATUS_STYLES[s] || "bg-gray-100 text-gray-600";

export const today = () => new Date().toISOString().slice(0, 10);

export const emptyForm = () => ({
  // student_id: "",
  full_name: "",
  dob: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  guardian_name: "",
  guardian_phone: "",
  qualification: "",
  course_id: "",
  batch_id: "",
  admitted_on: today(),
});

// Fields editable after admission (PUT /students/:id)
export const EDITABLE = ["full_name", "dob", "gender", "phone", "email", "address", "guardian_name", "guardian_phone", "qualification"];
