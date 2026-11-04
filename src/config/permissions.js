// Who can open what. One place to change when the permission matrix changes.
// The sidebar, the route guard and the dashboards all read from here.
// (This only controls what the screen shows. The API must still enforce the same rules.)

export const ROLE = {
  SUPER_ADMIN: "super_admin",
  OFFICE_STAFF: "office_staff",
  FACULTY: "faculty",
  LIBRARIAN: "librarian",
  STUDENT: "student",
};

const { SUPER_ADMIN, OFFICE_STAFF, FACULTY, LIBRARIAN, STUDENT } = ROLE;

// page key -> roles allowed ("all" = every logged-in user). Based on the Permission Matrix (15.2).
export const ACCESS = {
  dashboard: "all",
  notices: "all",
  files: "all",

  users: [SUPER_ADMIN], //                                   Users & Roles
  courses: [SUPER_ADMIN, OFFICE_STAFF, FACULTY, STUDENT], //  Course Master (faculty / student: view)
  facultyAssignments: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], // Course Master
  classSchedules: [SUPER_ADMIN, OFFICE_STAFF, FACULTY, STUDENT], // Class Schedule
  classTests: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //        Tests / Exams / Marks
  examResults: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //       Result Publish / Exams
  enquiries: [SUPER_ADMIN, OFFICE_STAFF], //                  Enquiry / Admission
  students: [SUPER_ADMIN, OFFICE_STAFF], //                   Admission / Documents / TC-LC
  fees: [SUPER_ADMIN, OFFICE_STAFF], //                       Fees / Receipts
  myFees: [STUDENT], //                                       Fees / Receipts: view own
  library: [SUPER_ADMIN, OFFICE_STAFF, LIBRARIAN], //         Library (office staff: view)
  auditLogs: [SUPER_ADMIN], //                                Audit Log
};

// Role of the logged-in user (saved at login, refreshed by the header)
export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("userData") || "null");
  } catch {
    return null;
  }
};

export const getCurrentRole = () => {
  const u = getCurrentUser();
  return typeof u?.role === "string" ? u.role : u?.role?.name || u?.roles?.[0]?.name || "";
};

// Unknown page keys are open; unknown roles only get the "all" pages
export const canAccess = (role, key) => {
  const allowed = ACCESS[key];
  if (!allowed) return true;
  if (allowed === "all") return true;
  return allowed.includes(role);
};

export const roleLabel = (role) =>
  String(role || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) || "User";
