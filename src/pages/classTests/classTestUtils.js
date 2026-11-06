// Shared constants and helpers for the Class Tests pages

// Statuses offered in the form. The API example shows "scheduled" - edit this list if your backend has others.
export const TEST_STATUSES = ["scheduled", "completed", "cancelled"];

export const TEST_STATUS_STYLES = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-gray-200 text-gray-600",
};
export const testStatusClass = (s) => TEST_STATUS_STYLES[String(s || "").toLowerCase()] || "bg-gray-100 text-gray-600";

export const today = () => new Date().toISOString().slice(0, 10);

export const emptyTest = {
  title: "",
  description: "",
  course_id: "",
  batch_id: "",
  subject: "",
  test_date: today(),
  max_marks: "",
  passing_marks: "",
  duration_minutes: "",
  status: "scheduled",
};

// Pass / fail for a mark, given the test's passing marks ("" when no mark yet)
export const resultOf = (marks, passing) => {
  if (marks === "" || marks === null || marks === undefined || Number.isNaN(Number(marks))) return "";
  return Number(marks) >= Number(passing) ? "pass" : "fail";
};
