// Shared constants and helpers for the Exams pages
import { today } from "../schedules/scheduleUtils";

// Offered in the form. The API example uses "written" / "scheduled" - edit these lists if your backend has more values.
export const EXAM_TYPES = ["written", "practical", "oral", "online"];
export const EXAM_STATUSES = ["scheduled", "completed", "cancelled"];

const STATUS_STYLES = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-200 text-gray-600",
};
export const examStatusClass = (s) => STATUS_STYLES[String(s || "").toLowerCase()] || "bg-gray-100 text-gray-600";

export const emptyExam = {
  title: "",
  description: "",
  course_id: "",
  batch_id: "",
  faculty_id: "",
  subject: "",
  exam_type: "written",
  exam_date: "",
  form_start_date: "",
  form_end_date: "",
  max_marks: "",
  passing_marks: "",
  duration_minutes: "",
  status: "scheduled",
};

// Pass / fail for a mark, given the exam's passing marks ("" when there is no mark yet)
export const resultOf = (marks, passing) => {
  if (marks === "" || marks === null || marks === undefined || Number.isNaN(Number(marks))) return "";
  return Number(marks) >= Number(passing) ? "pass" : "fail";
};

// Is the exam form window open today? -> "upcoming" | "open" | "closed" | "" (no window set)
export const formWindowState = (exam) => {
  const start = String(exam?.form_start_date || "").slice(0, 10);
  const end = String(exam?.form_end_date || "").slice(0, 10);
  if (!start || !end) return "";
  const now = today();
  return now < start ? "upcoming" : now > end ? "closed" : "open";
};
