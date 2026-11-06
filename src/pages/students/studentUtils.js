// import { titleCase } from "../../services/helpers";

// // Lifecycle stages the API accepts for PUT /students/:id/stage, in the order a student moves through them.
// // Note: "completed" is NOT a stage - finishing the course is the student's STATUS (Active / Completed / Left).
// // If the API ever reports a different list, change it here.
// export const LIFECYCLE_STAGES = [
//   "enquiry",
//   "admission",
//   "documents",
//   "fees",
//   "material",
//   "schedule",
//   "class_test",
//   "exam",
//   "exam_form",
//   "test",
//   "result",
//   "tc_lc",
// ];
// export const STAGE_STATUSES = ["pending", "in_progress", "completed"];

// const STAGE_LABELS = { tc_lc: "TC / LC", class_test: "Class test", exam_form: "Exam form" };
// export const stageLabel = (s) => STAGE_LABELS[s] || titleCase(s);

// const STAGE_STATUS_STYLES = {
//   pending: "bg-gray-100 text-gray-600",
//   in_progress: "bg-blue-100 text-blue-700",
//   completed: "bg-emerald-100 text-emerald-700",
// };
// export const stageStatusClass = (s) => STAGE_STATUS_STYLES[s] || "bg-gray-100 text-gray-600";

// /* ───── Student list / form constants ───── */

// export const STATUSES = ["active", "completed", "left"];
// export const GENDERS = ["male", "female", "other"];

// export const STATUS_STYLES = {
//   active: "bg-emerald-100 text-emerald-700",
//   completed: "bg-blue-100 text-blue-700",
//   left: "bg-gray-200 text-gray-600",
// };
// export const statusClass = (s) => STATUS_STYLES[s] || "bg-gray-100 text-gray-600";

// export const today = () => new Date().toISOString().slice(0, 10);

// export const emptyForm = () => ({
//   // student_id: "",
//   full_name: "",
//   dob: "",
//   gender: "",
//   phone: "",
//   email: "",
//   address: "",
//   guardian_name: "",
//   guardian_phone: "",
//   qualification: "",
//   course_id: "",
//   batch_id: "",
//   admitted_on: today(),
// });

// // Fields editable after admission (PUT /students/:id)
// export const EDITABLE = ["full_name", "dob", "gender", "phone", "email", "address", "guardian_name", "guardian_phone", "qualification"];




import { titleCase } from "../../services/helpers";

/* ───── Student list / form constants ───── */

export const STATUSES = ["active", "completed", "left"];
export const GENDERS = ["male", "female", "other"];

export const STATUS_STYLES = {
  active: "bg-emerald-100 text-emerald-700",
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