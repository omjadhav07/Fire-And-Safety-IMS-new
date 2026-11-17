// export const ROLE = {
//   SUPER_ADMIN: "super_admin",
//   OFFICE_STAFF: "office_staff",
//   FACULTY: "faculty",
//   LIBRARIAN: "librarian",
//   STUDENT: "student",
// };

// const { SUPER_ADMIN, OFFICE_STAFF, FACULTY, LIBRARIAN, STUDENT } = ROLE;

// // page key -> roles allowed ("all" = every logged-in user). Based on the Permission Matrix (15.2).
// export const ACCESS = {
//   dashboard: "all",
//   notices: "all",
//   files: "all",

//   users: [SUPER_ADMIN], //                                   Users & Roles
//   courses: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //           Course Master (faculty: view)
//   facultyAssignments: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], // Course Master
//   classSchedules: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //    Class Schedule
//   studyMaterial: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //     Study Material (office staff: view only)
//   classTests: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //        Tests / Exams / Marks
//   examResults: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //       Result Publish / Exams
//   examForms: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //         Exam Forms (staff view; students use the app)
//   enquiries: [SUPER_ADMIN, OFFICE_STAFF], //                  Enquiry / Admission
//   students: [SUPER_ADMIN, OFFICE_STAFF], //                   Admission / Documents / TC-LC
//   fees: [SUPER_ADMIN, OFFICE_STAFF], //                       Fees / Receipts
//   myFees: [], //                                              Students use the student app, not the website
//   library: [SUPER_ADMIN, OFFICE_STAFF, LIBRARIAN], //         Library (office staff: view)
//   auditLogs: [SUPER_ADMIN], //                                Audit Log
// };

// // Role of the logged-in user (saved at login, refreshed by the header)
// export const getCurrentUser = () => {
//   try {
//     return JSON.parse(localStorage.getItem("userData") || "null");
//   } catch {
//     return null;
//   }
// };

// export const getCurrentRole = () => {
//   const u = getCurrentUser();
//   return typeof u?.role === "string" ? u.role : u?.role?.name || u?.roles?.[0]?.name || "";
// };

// // Unknown page keys are open; unknown roles only get the "all" pages
// export const canAccess = (role, key) => {
//   const allowed = ACCESS[key];
//   if (!allowed) return true;
//   if (allowed === "all") return true;
//   return allowed.includes(role);
// };

// export const roleLabel = (role) =>
//   String(role || "")
//     .replace(/_/g, " ")
//     .replace(/\b\w/g, (c) => c.toUpperCase()) || "User";



// // Who can open what. One place to change when the permission matrix changes.
// // The sidebar, the route guard and the dashboards all read from here.
// // (This only controls what the screen shows. The API must still enforce the same rules.)

// export const ROLE = {
//   SUPER_ADMIN: "super_admin",
//   OFFICE_STAFF: "office_staff",
//   FACULTY: "faculty",
//   LIBRARIAN: "librarian",
//   STUDENT: "student",
// };

// const { SUPER_ADMIN, OFFICE_STAFF, FACULTY, LIBRARIAN, STUDENT } = ROLE;

// // page key -> roles allowed ("all" = every logged-in user). Based on the Permission Matrix (15.2).
// export const ACCESS = {
//   dashboard: "all",
//   notices: "all",
//   files: "all",

//   users: [SUPER_ADMIN], //                                   Users & Roles
//   courses: [SUPER_ADMIN, OFFICE_STAFF, FACULTY, STUDENT], //  Course Master (faculty / student: view)
//   facultyAssignments: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], // Course Master
//   classSchedules: [SUPER_ADMIN, OFFICE_STAFF, FACULTY, STUDENT], // Class Schedule
//   classTests: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //        Tests / Exams / Marks
//   examResults: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //       Result Publish / Exams
//   enquiries: [SUPER_ADMIN, OFFICE_STAFF], //                  Enquiry / Admission
//   students: [SUPER_ADMIN, OFFICE_STAFF], //                   Admission / Documents / TC-LC
//   fees: [SUPER_ADMIN, OFFICE_STAFF], //                       Fees / Receipts
//   myFees: [STUDENT], //                                       Fees / Receipts: view own
//   library: [SUPER_ADMIN, OFFICE_STAFF, LIBRARIAN], //         Library (office staff: view)
//   auditLogs: [SUPER_ADMIN], //                                Audit Log
// };

// // Role of the logged-in user (saved at login, refreshed by the header)
// export const getCurrentUser = () => {
//   try {
//     return JSON.parse(localStorage.getItem("userData") || "null");
//   } catch {
//     return null;
//   }
// };

// export const getCurrentRole = () => {
//   const u = getCurrentUser();
//   return typeof u?.role === "string" ? u.role : u?.role?.name || u?.roles?.[0]?.name || "";
// };

// // Unknown page keys are open; unknown roles only get the "all" pages
// export const canAccess = (role, key) => {
//   const allowed = ACCESS[key];
//   if (!allowed) return true;
//   if (allowed === "all") return true;
//   return allowed.includes(role);
// };

// export const roleLabel = (role) =>
//   String(role || "")
//     .replace(/_/g, " ")
//     .replace(/\b\w/g, (c) => c.toUpperCase()) || "User";



// Who can open what. One place to change when the permission matrix changes.
// The sidebar, the route guard and the dashboards all read from here.
// (This only controls what the screen shows. The API must still enforce the same rules.)

// export const ROLE = {
//   SUPER_ADMIN: "super_admin",
//   OFFICE_STAFF: "office_staff",
//   FACULTY: "faculty",
//   LIBRARIAN: "librarian",
//   STUDENT: "student",
// };

// const { SUPER_ADMIN, OFFICE_STAFF, FACULTY, LIBRARIAN, STUDENT } = ROLE;

// // page key -> roles allowed ("all" = every logged-in user). Based on the Permission Matrix (15.2).
// export const ACCESS = {
//   dashboard: "all",
//   notices: "all",
//   files: "all",

//   users: [SUPER_ADMIN], //                                   Users & Roles
//   courses: [SUPER_ADMIN, OFFICE_STAFF, FACULTY, STUDENT], //  Course Master (faculty / student: view)
//   facultyAssignments: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], // Course Master
//   classSchedules: [SUPER_ADMIN, OFFICE_STAFF, FACULTY, STUDENT], // Class Schedule
//   studyMaterial: [SUPER_ADMIN, OFFICE_STAFF, FACULTY, STUDENT], // Study Material (office staff / student: view only)
//   classTests: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //        Tests / Exams / Marks
//   examResults: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //       Result Publish / Exams
//   enquiries: [SUPER_ADMIN, OFFICE_STAFF], //                  Enquiry / Admission
//   students: [SUPER_ADMIN, OFFICE_STAFF], //                   Admission / Documents / TC-LC
//   fees: [SUPER_ADMIN, OFFICE_STAFF], //                       Fees / Receipts
//   myFees: [STUDENT], //                                       Fees / Receipts: view own
//   library: [SUPER_ADMIN, OFFICE_STAFF, LIBRARIAN], //         Library (office staff: view)
//   auditLogs: [SUPER_ADMIN], //                                Audit Log
// };

// // Role of the logged-in user (saved at login, refreshed by the header)
// export const getCurrentUser = () => {
//   try {
//     return JSON.parse(localStorage.getItem("userData") || "null");
//   } catch {
//     return null;
//   }
// };

// export const getCurrentRole = () => {
//   const u = getCurrentUser();
//   return typeof u?.role === "string" ? u.role : u?.role?.name || u?.roles?.[0]?.name || "";
// };

// // Unknown page keys are open; unknown roles only get the "all" pages
// export const canAccess = (role, key) => {
//   const allowed = ACCESS[key];
//   if (!allowed) return true;
//   if (allowed === "all") return true;
//   return allowed.includes(role);
// };

// export const roleLabel = (role) =>
//   String(role || "")
//     .replace(/_/g, " ")
//     .replace(/\b\w/g, (c) => c.toUpperCase()) || "User";
    

// Who can open what. One place to change when the permission matrix changes.
// The sidebar, the route guard and the dashboards all read from here.
// (This only controls what the screen shows. The API must still enforce the same rules.)
// import { useEffect, useState } from "react";

// export const ROLE = {
//   SUPER_ADMIN: "super_admin",
//   OFFICE_STAFF: "office_staff",
//   FACULTY: "faculty",
//   LIBRARIAN: "librarian",
//   STUDENT: "student",
// };

// const { SUPER_ADMIN, OFFICE_STAFF, FACULTY, LIBRARIAN, STUDENT } = ROLE;

// // page key -> roles allowed ("all" = every logged-in user). Based on the Permission Matrix (15.2).
// // Used as the fallback while the user's own permissions are not known (see PAGE_PERMISSIONS below).
// export const ACCESS = {
//   dashboard: "all",
//   notices: "all",
//   files: "all",

//   users: [SUPER_ADMIN], //                                   Users & Roles
//   courses: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //           Course Master (faculty: view)
//   facultyAssignments: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], // Course Master
//   classSchedules: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //    Class Schedule
//   studyMaterial: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //     Study Material (office staff: view only)
//   classTests: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //        Tests / Exams / Marks
//   examResults: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //       Result Publish / Exams
//   examForms: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //         Exam Forms (staff view; students use the app)
//   enquiries: [SUPER_ADMIN, OFFICE_STAFF], //                  Enquiry / Admission
//   students: [SUPER_ADMIN, OFFICE_STAFF], //                   Admission / Documents / TC-LC
//   fees: [SUPER_ADMIN, OFFICE_STAFF], //                       Fees / Receipts
//   myFees: [], //                                              Students use the student app, not the website
//   library: [SUPER_ADMIN, OFFICE_STAFF, LIBRARIAN], //         Library (office staff: view)
//   tcLc: [SUPER_ADMIN, OFFICE_STAFF], //                       TC / LC
//   auditLogs: [SUPER_ADMIN], //                                Audit Log
// };

// // page key -> permission codes (from Roles & Permissions). The page opens when the user's role has ANY of them.
// // Edit a role's permissions in Roles & Permissions and the sidebar / pages follow it. Super Admin always sees everything.
// // dashboard, notices and files are open to every logged-in user.
// export const PAGE_PERMISSIONS = {
//   users: ["users.manage"],
//   courses: ["courses.manage"],
//   facultyAssignments: ["courses.manage"],
//   classSchedules: ["courses.manage"],
//   studyMaterial: ["courses.manage", "exams.manage"], //  no study-material permission exists yet
//   classTests: ["exams.manage"],
//   examResults: ["exams.manage"],
//   examForms: ["exams.manage", "exam_forms.override"],
//   enquiries: ["students.manage"],
//   students: ["students.manage", "students.view"],
//   fees: ["fees.manage", "fees.view"],
//   library: ["library.manage"],
//   tcLc: ["tc_lc.manage"],
//   auditLogs: ["users.manage"], //                        no audit-log permission exists yet
// };

// // Role of the logged-in user (saved at login, refreshed by the header)
// export const getCurrentUser = () => {
//   try {
//     return JSON.parse(localStorage.getItem("userData") || "null");
//   } catch {
//     return null;
//   }
// };

// export const getCurrentRole = () => {
//   const u = getCurrentUser();
//   return typeof u?.role === "string" ? u.role : u?.role?.name || u?.roles?.[0]?.name || "";
// };

// // Permission codes of a user, read from user.permissions, user.role.permissions or user.roles[].permissions
// // (codes or { _id, code } objects). Returns null when the API did not send them.
// const toCodes = (list) => {
//   if (!Array.isArray(list)) return null;
//   const codes = list.map((p) => (typeof p === "string" ? p : p?.code)).filter(Boolean);
//   return codes.length && !codes.some((c) => c.includes(".")) ? null : codes; // ids only -> unknown
// };

// export const getPermissionCodes = (user = getCurrentUser()) => {
//   if (!user) return null;
//   const direct = toCodes(user.permissions) ?? toCodes(user.role?.permissions);
//   if (direct) return direct;
//   if (Array.isArray(user.roles)) {
//     const lists = user.roles.map((r) => toCodes(r?.permissions)).filter(Boolean);
//     if (lists.length) return [...new Set(lists.flat())];
//   }
//   return null;
// };

// // Unknown page keys are open. Super Admin follows the fixed list above (always full access).
// // Everyone else follows their permission codes; if the API did not send any, the role list is used.
// export const canAccess = (role, key) => {
//   const allowed = ACCESS[key];
//   if (!allowed) return true;
//   if (allowed === "all") return true;
//   if (role === SUPER_ADMIN) return allowed.includes(SUPER_ADMIN);
//   const codes = getPermissionCodes();
//   const needed = PAGE_PERMISSIONS[key];
//   if (codes && needed) return needed.some((c) => codes.includes(c));
//   return allowed.includes(role);
// };

// // Re-render a component when the saved user changes (the header refreshes it from /auth/me)
// const USER_EVENT = "ims:user-updated";
// export const notifyUserChanged = () => window.dispatchEvent(new Event(USER_EVENT));
// export const useUserRefresh = () => {
//   const [, setTick] = useState(0);
//   useEffect(() => {
//     const onChange = () => setTick((n) => n + 1);
//     window.addEventListener(USER_EVENT, onChange);
//     return () => window.removeEventListener(USER_EVENT, onChange);
//   }, []);
// };

// export const roleLabel = (role) =>
//   String(role || "")
//     .replace(/_/g, " ")
//     .replace(/\b\w/g, (c) => c.toUpperCase()) || "User";


// 14 nov

// import { useEffect, useState } from "react";

// export const ROLE = {
//   SUPER_ADMIN: "super_admin",
//   OFFICE_STAFF: "office_staff",
//   FACULTY: "faculty",
//   LIBRARIAN: "librarian",
//   STUDENT: "student",
// };

// const { SUPER_ADMIN, OFFICE_STAFF, FACULTY, LIBRARIAN, STUDENT } = ROLE;

// // page key -> roles allowed ("all" = every logged-in user). Based on the Permission Matrix (15.2).
// // Used as the fallback while the user's own permissions are not known (see PAGE_PERMISSIONS below).
// export const ACCESS = {
//   dashboard: "all",
//   notices: "all",
//   files: "all",

//   users: [SUPER_ADMIN], //                                   Users & Roles
//   courses: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //           Course Master (faculty: view)
//   subjects: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //          Course Master > Subjects
//   facultyAssignments: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], // Course Master
//   classSchedules: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //    Class Schedule
//   studyMaterial: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //     Study Material (office staff: view only)
//   classTests: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //        Tests / Exams / Marks
//   examResults: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //       Result Publish / Exams
//   examForms: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //         Exam Forms (staff view; students use the app)
//   enquiries: [SUPER_ADMIN, OFFICE_STAFF], //                  Enquiry / Admission
//   students: [SUPER_ADMIN, OFFICE_STAFF], //                   Admission / Documents / TC-LC
//   fees: [SUPER_ADMIN, OFFICE_STAFF], //                       Fees / Receipts
//   myFees: [], //                                              Students use the student app, not the website
//   library: [SUPER_ADMIN, OFFICE_STAFF, LIBRARIAN], //         Library (office staff: view)
//   tcLc: [SUPER_ADMIN, OFFICE_STAFF], //                       TC / LC
//   auditLogs: [SUPER_ADMIN], //                                Audit Log
// };

// // page key -> permission codes (from Roles & Permissions). The page opens when the user's role has ANY of them.
// // Edit a role's permissions in Roles & Permissions and the sidebar / pages follow it. Super Admin always sees everything.
// // dashboard, notices and files are open to every logged-in user.
// export const PAGE_PERMISSIONS = {
//   users: ["users.manage"],
//   courses: ["courses.manage"],
//   subjects: ["courses.manage"],
//   facultyAssignments: ["courses.manage"],
//   classSchedules: ["courses.manage"],
//   studyMaterial: ["courses.manage", "exams.manage"], //  no study-material permission exists yet
//   classTests: ["exams.manage"],
//   examResults: ["exams.manage"],
//   examForms: ["exams.manage", "exam_forms.override"],
//   enquiries: ["students.manage"],
//   students: ["students.manage", "students.view"],
//   fees: ["fees.manage", "fees.view"],
//   library: ["library.manage"],
//   tcLc: ["tc_lc.manage"],
//   auditLogs: ["users.manage"], //                        no audit-log permission exists yet
// };

// // Role of the logged-in user (saved at login, refreshed by the header)
// export const getCurrentUser = () => {
//   try {
//     return JSON.parse(localStorage.getItem("userData") || "null");
//   } catch {
//     return null;
//   }
// };

// export const getCurrentRole = () => {
//   const u = getCurrentUser();
//   return typeof u?.role === "string" ? u.role : u?.role?.name || u?.roles?.[0]?.name || "";
// };

// // Permission codes of a user, read from user.permissions, user.role.permissions or user.roles[].permissions
// // (codes or { _id, code } objects). Returns null when the API did not send them.
// const toCodes = (list) => {
//   if (!Array.isArray(list)) return null;
//   const codes = list.map((p) => (typeof p === "string" ? p : p?.code)).filter(Boolean);
//   return codes.length && !codes.some((c) => c.includes(".")) ? null : codes; // ids only -> unknown
// };

// export const getPermissionCodes = (user = getCurrentUser()) => {
//   if (!user) return null;
//   const direct = toCodes(user.permissions) ?? toCodes(user.role?.permissions);
//   if (direct) return direct;
//   if (Array.isArray(user.roles)) {
//     const lists = user.roles.map((r) => toCodes(r?.permissions)).filter(Boolean);
//     if (lists.length) return [...new Set(lists.flat())];
//   }
//   return null;
// };

// // Unknown page keys are open. Super Admin follows the fixed list above (always full access).
// // Everyone else follows their permission codes; if the API did not send any, the role list is used.
// export const canAccess = (role, key) => {
//   const allowed = ACCESS[key];
//   if (!allowed) return true;
//   if (allowed === "all") return true;
//   if (role === SUPER_ADMIN) return allowed.includes(SUPER_ADMIN);
//   const codes = getPermissionCodes();
//   const needed = PAGE_PERMISSIONS[key];
//   if (codes && needed) return needed.some((c) => codes.includes(c));
//   return allowed.includes(role);
// };

// // Re-render a component when the saved user changes (the header refreshes it from /auth/me)
// const USER_EVENT = "ims:user-updated";
// export const notifyUserChanged = () => window.dispatchEvent(new Event(USER_EVENT));
// export const useUserRefresh = () => {
//   const [, setTick] = useState(0);
//   useEffect(() => {
//     const onChange = () => setTick((n) => n + 1);
//     window.addEventListener(USER_EVENT, onChange);
//     return () => window.removeEventListener(USER_EVENT, onChange);
//   }, []);
// };

// export const roleLabel = (role) =>
//   String(role || "")
//     .replace(/_/g, " ")
//     .replace(/\b\w/g, (c) => c.toUpperCase()) || "User";



// 16 nov

// src/config/permissions.js
//
// One file for who may see / do what in the IMS website.
//   - Sidebar and page guards ask:       canAccess(role, "fees")
//   - Buttons / tabs inside a page ask:  useSafePagePermissions().canCreateInPage(MODULES.FEES, PAGES.FEES.FEES)
// Both use the permissions of the logged-in user (Roles & Permissions page), which come as
//   1) permission codes:   "fees.view", "courses.manage" ...   (strings or { _id, code })
//   2) permission objects: { module, page, action, tab? }       (if the backend sends them later)
// If the API sends no permissions at all, the role lists in ACCESS are used instead.
// Super Admin always has every permission.

import { createElement, useEffect, useState } from "react";

export const ROLE = {
  SUPER_ADMIN: "super_admin",
  OFFICE_STAFF: "office_staff",
  FACULTY: "faculty",
  LIBRARIAN: "librarian",
  STUDENT: "student",
};

const { SUPER_ADMIN, OFFICE_STAFF, FACULTY, LIBRARIAN } = ROLE;

// ───────────── 1) Fallback by role (used only when the API sends no permissions) ─────────────
// page key -> roles allowed ("all" = every logged-in user)
export const ACCESS = {
  dashboard: "all",
  notices: "all",
  files: "all",

  users: [SUPER_ADMIN], //                                    Users & Roles
  courses: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //            Course Master (faculty: view)
  subjects: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //           Course Master > Subjects
  facultyAssignments: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //  Course Master
  classSchedules: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //     Class Schedule
  studyMaterial: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //      Study Material (office staff: view only)
  classTests: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //         Tests / Marks
  examResults: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //        Result Publish / Exams
  examForms: [SUPER_ADMIN, OFFICE_STAFF, FACULTY], //          Exam Forms (staff view; students use the app)
  enquiries: [SUPER_ADMIN, OFFICE_STAFF], //                   Enquiry / Admission
  students: [SUPER_ADMIN, OFFICE_STAFF], //                    Admission / Documents / TC-LC
  fees: [SUPER_ADMIN, OFFICE_STAFF], //                        Fees / Receipts
  myFees: [], //                                               Students use the student app, not the website
  library: [SUPER_ADMIN, OFFICE_STAFF, LIBRARIAN], //          Library (office staff: view)
  tcLc: [SUPER_ADMIN, OFFICE_STAFF], //                        TC / LC
  auditLogs: [SUPER_ADMIN], //                                 Audit Log
};

// ───────────── 2) Modules, pages, tabs, actions ─────────────
export const ACTIONS = {
  VIEW: "VIEW",
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  EXPORT: "EXPORT",
  IMPORT: "IMPORT",
  PRINT: "PRINT",
  APPROVE: "APPROVE",
  REJECT: "REJECT",
};

export const MODULES = {
  DASHBOARD: "DASHBOARD",
  USER_MANAGEMENT: "USER MANAGEMENT",
  COURSE_MASTER: "COURSE MASTER",
  STUDY_MATERIAL: "STUDY MATERIAL",
  LIBRARY: "LIBRARY",
  TC_LC: "TC/LC",
  EXAMS: "EXAMS",
  ENQUIRIES: "ENQUIRIES",
  STUDENTS: "STUDENTS",
  FEES: "FEES",
  NOTICES: "NOTICES",
  FILES: "FILES",
  AUDIT_LOGS: "AUDIT LOGS",
};

// Page names as shown in the sidebar
export const PAGES = {
  DASHBOARD: { DASHBOARD: "Dashboard" },
  USER_MANAGEMENT: { USER_LIST: "User List", ADD_USER: "Add User", ROLES: "Roles & Permissions" },
  COURSE_MASTER: {
    COURSES: "Courses",
    SUBJECTS: "Subjects",
    FACULTY_ASSIGNMENTS: "Faculty Assignments",
    CLASS_SCHEDULES: "Class Schedules",
  },
  STUDY_MATERIAL: { STUDY_MATERIAL: "Study Material" },
  LIBRARY: { BOOKS: "Books", CATEGORIES: "Categories", ISSUES: "Issues" },
  TC_LC: { TC_LC: "TC/LC" },
  EXAMS: { RESULTS: "Results", CLASS_TESTS: "Class Tests", EXAMS: "Exams", EXAM_FORMS: "Exam Forms" },
  ENQUIRIES: { ENQUIRIES: "Enquiries" },
  STUDENTS: { STUDENTS: "Students" },
  FEES: { FEES: "Fees" },
  NOTICES: { NOTICES: "Notices" },
  FILES: { MY_FILES: "My Files" },
  AUDIT_LOGS: { AUDIT_LOGS: "Audit Logs" },
};

// Tabs, only for pages that have tabs
export const TABS = {
  USER_LIST: { STAFF: "STAFF", STUDENTS: "STUDENTS" },
  FEES: { PENDING_FEES: "PENDING FEES", RECENT_PAYMENTS: "RECENT PAYMENTS" },
  ENQUIRIES: { NEW: "NEW", CONVERTED: "CONVERTED" },
};

export const getTabsForPage = (page) =>
  ({
    [PAGES.USER_MANAGEMENT.USER_LIST]: TABS.USER_LIST,
    [PAGES.FEES.FEES]: TABS.FEES,
    [PAGES.ENQUIRIES.ENQUIRIES]: TABS.ENQUIRIES,
  })[page] || null;

// ───────────── 3) Which permission codes open which page / action ─────────────
// Edit this table to change what a permission code allows. "all" = every action without its own entry.
// A page is open to the role when ANY listed code is in the role's permissions.
const P = PAGES;
const PAGE_CODES = {
  [P.USER_MANAGEMENT.USER_LIST]: { all: ["users.manage"] },
  [P.USER_MANAGEMENT.ADD_USER]: { all: ["users.manage"] },
  [P.USER_MANAGEMENT.ROLES]: { all: ["users.manage"] },

  [P.COURSE_MASTER.COURSES]: { all: ["courses.manage"] },
  [P.COURSE_MASTER.SUBJECTS]: { all: ["courses.manage"] },
  [P.COURSE_MASTER.FACULTY_ASSIGNMENTS]: { all: ["courses.manage"] },
  [P.COURSE_MASTER.CLASS_SCHEDULES]: { all: ["courses.manage"] },

  [P.STUDY_MATERIAL.STUDY_MATERIAL]: { all: ["courses.manage", "exams.manage"] }, // no study-material permission exists yet

  [P.LIBRARY.BOOKS]: { all: ["library.manage"] },
  [P.LIBRARY.CATEGORIES]: { all: ["library.manage"] },
  [P.LIBRARY.ISSUES]: { all: ["library.manage"] },

  [P.TC_LC.TC_LC]: { all: ["tc_lc.manage"] },

  [P.EXAMS.RESULTS]: { all: ["exams.manage"] },
  [P.EXAMS.CLASS_TESTS]: { all: ["exams.manage"] },
  [P.EXAMS.EXAMS]: { all: ["exams.manage"] },
  [P.EXAMS.EXAM_FORMS]: { all: ["exams.manage", "exam_forms.override"] },

  [P.ENQUIRIES.ENQUIRIES]: { all: ["students.manage"] },

  // "view" codes only allow VIEW; "manage" codes allow every action
  [P.STUDENTS.STUDENTS]: { VIEW: ["students.view", "students.manage"], all: ["students.manage"] },
  [P.FEES.FEES]: { VIEW: ["fees.view", "fees.manage"], all: ["fees.manage"] },

  [P.AUDIT_LOGS.AUDIT_LOGS]: { all: ["users.manage"] }, // no audit-log permission exists yet
};

// Every logged-in user may VIEW these
const OPEN_PAGES = new Set([P.DASHBOARD.DASHBOARD, P.NOTICES.NOTICES, P.FILES.MY_FILES]);

// access key (ACCESS above / route guards / sidebar)  ->  [module, page]
const ACCESS_PAGE = {
  dashboard: [MODULES.DASHBOARD, P.DASHBOARD.DASHBOARD],
  notices: [MODULES.NOTICES, P.NOTICES.NOTICES],
  files: [MODULES.FILES, P.FILES.MY_FILES],
  users: [MODULES.USER_MANAGEMENT, P.USER_MANAGEMENT.USER_LIST],
  courses: [MODULES.COURSE_MASTER, P.COURSE_MASTER.COURSES],
  subjects: [MODULES.COURSE_MASTER, P.COURSE_MASTER.SUBJECTS],
  facultyAssignments: [MODULES.COURSE_MASTER, P.COURSE_MASTER.FACULTY_ASSIGNMENTS],
  classSchedules: [MODULES.COURSE_MASTER, P.COURSE_MASTER.CLASS_SCHEDULES],
  studyMaterial: [MODULES.STUDY_MATERIAL, P.STUDY_MATERIAL.STUDY_MATERIAL],
  classTests: [MODULES.EXAMS, P.EXAMS.CLASS_TESTS],
  examResults: [MODULES.EXAMS, P.EXAMS.RESULTS],
  examForms: [MODULES.EXAMS, P.EXAMS.EXAM_FORMS],
  enquiries: [MODULES.ENQUIRIES, P.ENQUIRIES.ENQUIRIES],
  students: [MODULES.STUDENTS, P.STUDENTS.STUDENTS],
  fees: [MODULES.FEES, P.FEES.FEES],
  library: [MODULES.LIBRARY, P.LIBRARY.BOOKS],
  tcLc: [MODULES.TC_LC, P.TC_LC.TC_LC],
  auditLogs: [MODULES.AUDIT_LOGS, P.AUDIT_LOGS.AUDIT_LOGS],
};

// ───────────── 4) Route <-> module / page ─────────────
const ROUTES = {
  "/dashboard": [MODULES.DASHBOARD, P.DASHBOARD.DASHBOARD],
  "/users": [MODULES.USER_MANAGEMENT, P.USER_MANAGEMENT.USER_LIST],
  "/users/add-user": [MODULES.USER_MANAGEMENT, P.USER_MANAGEMENT.ADD_USER],
  "/roles": [MODULES.USER_MANAGEMENT, P.USER_MANAGEMENT.ROLES],
  "/courses": [MODULES.COURSE_MASTER, P.COURSE_MASTER.COURSES],
  "/subjects": [MODULES.COURSE_MASTER, P.COURSE_MASTER.SUBJECTS],
  "/faculty-assignments": [MODULES.COURSE_MASTER, P.COURSE_MASTER.FACULTY_ASSIGNMENTS],
  "/class-schedules": [MODULES.COURSE_MASTER, P.COURSE_MASTER.CLASS_SCHEDULES],
  "/study-material": [MODULES.STUDY_MATERIAL, P.STUDY_MATERIAL.STUDY_MATERIAL],
  "/library/books": [MODULES.LIBRARY, P.LIBRARY.BOOKS],
  "/library/categories": [MODULES.LIBRARY, P.LIBRARY.CATEGORIES],
  "/library/issues": [MODULES.LIBRARY, P.LIBRARY.ISSUES],
  "/tc-lc": [MODULES.TC_LC, P.TC_LC.TC_LC],
  "/results": [MODULES.EXAMS, P.EXAMS.RESULTS],
  "/exam-results": [MODULES.EXAMS, P.EXAMS.RESULTS],
  "/class-tests": [MODULES.EXAMS, P.EXAMS.CLASS_TESTS],
  "/exams": [MODULES.EXAMS, P.EXAMS.EXAMS],
  "/exam-forms": [MODULES.EXAMS, P.EXAMS.EXAM_FORMS],
  "/enquiries": [MODULES.ENQUIRIES, P.ENQUIRIES.ENQUIRIES],
  "/students": [MODULES.STUDENTS, P.STUDENTS.STUDENTS],
  "/fees": [MODULES.FEES, P.FEES.FEES],
  "/notices": [MODULES.NOTICES, P.NOTICES.NOTICES],
  "/files": [MODULES.FILES, P.FILES.MY_FILES],
  "/audit-logs": [MODULES.AUDIT_LOGS, P.AUDIT_LOGS.AUDIT_LOGS],
};

// Also accepts nested paths such as /exams/123/results or /class-tests/456
const lookupRoute = (routePath) => {
  const path = String(routePath || "").split("?")[0].replace(/\/+$/, "") || "/";
  if (ROUTES[path]) return ROUTES[path];
  const parts = path.split("/").filter(Boolean);
  while (parts.length > 1) {
    parts.pop();
    const hit = ROUTES[`/${parts.join("/")}`];
    if (hit) return hit;
  }
  return null;
};
export const getModuleFromRoute = (routePath) => lookupRoute(routePath)?.[0] || null;
export const getPageFromRoute = (routePath) => lookupRoute(routePath)?.[1] || null;

// ───────────── 5) The logged-in user ─────────────
// Saved at login and refreshed by the header (/auth/me)
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

export const roleLabel = (role) =>
  String(role || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) || "User";

// Permission codes of a user, read from user.permissions, user.role.permissions or user.roles[].permissions
// (codes or { _id, code } objects). Returns null when the API did not send them (or only sent ids).
const toCodes = (list) => {
  if (!Array.isArray(list)) return null;
  const codes = list.map((p) => (typeof p === "string" ? p : p?.code)).filter(Boolean);
  return codes.length && !codes.some((c) => c.includes(".")) ? null : codes;
};

export const getPermissionCodes = (user = getCurrentUser()) => {
  if (!user) return null;
  const direct = toCodes(user.permissions) ?? toCodes(user.role?.permissions);
  if (direct) return direct;
  if (Array.isArray(user.roles)) {
    const lists = user.roles.map((r) => toCodes(r?.permissions)).filter(Boolean);
    if (lists.length) return [...new Set(lists.flat())];
  }
  return null;
};

// Pass this instead of a permissions list to allow everything (Super Admin)
export const ALL = "*";

// Permissions to check against: Super Admin -> ALL, others -> their list from the API
export const getUserPermissions = () => {
  if (getCurrentRole() === SUPER_ADMIN) return ALL;
  const u = getCurrentUser();
  const list = u?.permissions ?? u?.role?.permissions ?? u?.roles?.flatMap((r) => r?.permissions || []);
  return Array.isArray(list) ? list : [];
};

// ───────────── 6) Checks: module > page > tab > action ─────────────
const up = (v) => String(v ?? "").toUpperCase();
const asList = (permissions) => (Array.isArray(permissions) ? permissions : []);
const isObjectPerm = (p) => p && typeof p === "object" && p.module && p.page && p.action;
const codeOf = (p) => (typeof p === "string" ? p : p && typeof p === "object" && !p.module ? p.code : "");

const objectMatches = (permissions, module, page, tab) =>
  asList(permissions).filter(
    (p) =>
      isObjectPerm(p) &&
      up(p.module) === up(module) &&
      String(p.page) === String(page) &&
      (tab ? up(p.tab) === up(tab) : !p.tab)
  );

const hasTabEntries = (permissions, module, page) =>
  asList(permissions).some((p) => isObjectPerm(p) && up(p.module) === up(module) && String(p.page) === String(page) && p.tab);

const codeActions = (permissions, page) => {
  const rule = PAGE_CODES[page];
  if (!rule) return [];
  const have = new Set(asList(permissions).map(codeOf).filter(Boolean));
  const any = (codes) => (codes || []).some((c) => have.has(c));
  return Object.values(ACTIONS).filter((action) => any(rule[action] ?? rule.all));
};

// All actions allowed on a page / tab
export const getAvailableActions = (permissions, module, page, tab = null) => {
  try {
    if (!module || !page) return [];
    if (permissions === ALL) return Object.values(ACTIONS);
    const actions = new Set();
    if (OPEN_PAGES.has(page)) actions.add(ACTIONS.VIEW);

    // Object style: a tab asks for its own entries; if the page has no tab entries at all, the page entries apply
    const useTab = tab && hasTabEntries(permissions, module, page);
    objectMatches(permissions, module, page, useTab ? tab : null).forEach((p) => actions.add(up(p.action)));

    // Code style: the codes give the same actions on every tab of the page
    codeActions(permissions, page).forEach((a) => actions.add(a));
    return [...actions];
  } catch (error) {
    console.error("Error in getAvailableActions:", error);
    return [];
  }
};

export const hasSafePagePermission = (permissions, module, page, action, tab = null) =>
  !!(module && page && action) && getAvailableActions(permissions, module, page, tab).includes(up(action));

export const hasAnyAction = (permissions, module, page, actions, tab = null) => {
  if (!Array.isArray(actions)) return false;
  const have = getAvailableActions(permissions, module, page, tab);
  return actions.some((a) => have.includes(up(a)));
};

const PAGES_OF_MODULE = Object.fromEntries(Object.entries(MODULES).map(([key, name]) => [name, Object.values(PAGES[key] || {})]));

export const hasSafePermission = (permissions, module, action) =>
  (PAGES_OF_MODULE[module] || []).some((page) => hasSafePagePermission(permissions, module, page, action));

export const canAccessPage = (permissions, module, page) => getAvailableActions(permissions, module, page).length > 0;
export const canAccessTab = (permissions, module, page, tab) => getAvailableActions(permissions, module, page, tab).length > 0;

export const canViewPage = (permissions, module, page, tab = null) => hasSafePagePermission(permissions, module, page, ACTIONS.VIEW, tab);
export const canViewTab = (permissions, module, page, tab) => canViewPage(permissions, module, page, tab);
export const canCreateInPage = (permissions, module, page, tab = null) => hasSafePagePermission(permissions, module, page, ACTIONS.CREATE, tab);
export const canUpdateInPage = (permissions, module, page, tab = null) => hasSafePagePermission(permissions, module, page, ACTIONS.UPDATE, tab);
export const canDeleteInPage = (permissions, module, page, tab = null) => hasSafePagePermission(permissions, module, page, ACTIONS.DELETE, tab);

export const canViewModule = (permissions, module) => hasSafePermission(permissions, module, ACTIONS.VIEW);
export const canCreateInModule = (permissions, module) => hasSafePermission(permissions, module, ACTIONS.CREATE);
export const canUpdateInModule = (permissions, module) => hasSafePermission(permissions, module, ACTIONS.UPDATE);
export const canDeleteInModule = (permissions, module) => hasSafePermission(permissions, module, ACTIONS.DELETE);

export const getPagePermissions = (permissions, module, page, tab = null) => getAvailableActions(permissions, module, page, tab);

export const getAccessibleTabs = (permissions, module, page) => {
  const tabs = getTabsForPage(page);
  return tabs ? Object.values(tabs).filter((tab) => canViewTab(permissions, module, page, tab)) : [];
};

export const getAccessibleTabsWithActions = (permissions, module, page) => {
  const tabs = getTabsForPage(page);
  if (!tabs) return [];
  return Object.entries(tabs).map(([key, name]) => {
    const availableActions = getAvailableActions(permissions, module, page, name);
    return { key, name, availableActions, canView: availableActions.includes(ACTIONS.VIEW), canAccess: availableActions.length > 0 };
  });
};

export const canViewRoute = (permissions, routePath, action = ACTIONS.VIEW) => {
  const module = getModuleFromRoute(routePath);
  const page = getPageFromRoute(routePath);
  return module && page ? hasSafePagePermission(permissions, module, page, action) : false;
};

export const getAccessibleRoutes = (permissions) => Object.keys(ROUTES).filter((route) => canViewRoute(permissions, route));

// ───────────── 7) Sidebar / page guards: canAccess(role, "fees") ─────────────
// Unknown page keys are open. Super Admin follows the fixed list above (always full access).
// Everyone else follows their permissions; if the API sent none, the role list is used.
export const canAccess = (role, key) => {
  const allowed = ACCESS[key];
  if (!allowed) return true;
  if (allowed === "all") return true;
  if (role === SUPER_ADMIN) return allowed.includes(SUPER_ADMIN);
  const codes = getPermissionCodes();
  const target = ACCESS_PAGE[key];
  if (codes && target) return hasSafePagePermission(codes, target[0], target[1], ACTIONS.VIEW);
  return allowed.includes(role);
};

// ───────────── 8) Refresh when the saved user changes ─────────────
const USER_EVENT = "ims:user-updated";
export const notifyUserChanged = () => window.dispatchEvent(new Event(USER_EVENT));
export const useUserRefresh = () => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const onChange = () => setTick((n) => n + 1);
    window.addEventListener(USER_EVENT, onChange);
    return () => window.removeEventListener(USER_EVENT, onChange);
  }, []);
};

// ───────────── 9) Hook for buttons / tabs inside a page ─────────────
export const useSafePagePermissions = () => {
  useUserRefresh();
  const permissions = getUserPermissions();
  return {
    permissions,
    hasPagePermission: (module, page, action, tab = null) => hasSafePagePermission(permissions, module, page, action, tab),
    hasTabPermission: (module, page, tab, action) => hasSafePagePermission(permissions, module, page, action, tab),
    hasAnyAction: (module, page, actions, tab = null) => hasAnyAction(permissions, module, page, actions, tab),
    hasPermission: (module, action) => hasSafePermission(permissions, module, action),
    hasRoutePermission: (routePath, action = ACTIONS.VIEW) => canViewRoute(permissions, routePath, action),
    getAvailableActions: (module, page, tab = null) => getAvailableActions(permissions, module, page, tab),
    canAccessPage: (module, page) => canAccessPage(permissions, module, page),
    canAccessTab: (module, page, tab) => canAccessTab(permissions, module, page, tab),
    canViewPage: (module, page, tab = null) => canViewPage(permissions, module, page, tab),
    canViewTab: (module, page, tab) => canViewTab(permissions, module, page, tab),
    canCreateInPage: (module, page, tab = null) => canCreateInPage(permissions, module, page, tab),
    canUpdateInPage: (module, page, tab = null) => canUpdateInPage(permissions, module, page, tab),
    canDeleteInPage: (module, page, tab = null) => canDeleteInPage(permissions, module, page, tab),
    canViewRoute: (routePath) => canViewRoute(permissions, routePath),
    getPagePermissions: (module, page, tab = null) => getPagePermissions(permissions, module, page, tab),
    getAccessibleTabs: (module, page) => getAccessibleTabs(permissions, module, page),
    getAccessibleTabsWithActions: (module, page) => getAccessibleTabsWithActions(permissions, module, page),
    getAccessibleRoutes: () => getAccessibleRoutes(permissions),
    getTabsForPage,
  };
};

// ───────────── 10) Guards and higher-order components ─────────────
// Guards return the children when allowed, otherwise the fallback (nothing by default).
export const SafePagePermissionGuard = ({ permissions, module, page, action = ACTIONS.VIEW, children, fallback = null }) =>
  hasSafePagePermission(permissions, module, page, action) ? children : fallback;

export const SafeTabPermissionGuard = ({ permissions, module, page, tab, action = ACTIONS.VIEW, children, fallback = null }) =>
  hasSafePagePermission(permissions, module, page, action, tab) ? children : fallback;

export const SafeTabAccessGuard = ({ permissions, module, page, tab, children, fallback = null }) =>
  canAccessTab(permissions, module, page, tab) ? children : fallback;

export const SafeRoutePermissionGuard = ({ permissions, routePath, action = ACTIONS.VIEW, children, fallback = null }) =>
  canViewRoute(permissions, routePath, action) ? children : fallback;

const denied = (text) =>
  createElement("div", { className: "m-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3", role: "alert" }, text);

export const withSafePagePermission = (Component, module, page, action = ACTIONS.VIEW) =>
  function SafeProtectedComponent(props) {
    const { hasPagePermission } = useSafePagePermissions();
    return hasPagePermission(module, page, action) ? createElement(Component, props) : denied("You do not have permission to access this page.");
  };

export const withSafeTabPermission = (Component, module, page, tab, action = ACTIONS.VIEW) =>
  function SafeTabProtectedComponent(props) {
    const { hasTabPermission } = useSafePagePermissions();
    return hasTabPermission(module, page, tab, action) ? createElement(Component, props) : denied("You do not have permission to access this tab.");
  };

export const withRoutePermission = (Component, routePath, action = ACTIONS.VIEW) =>
  function SafeRouteProtectedComponent(props) {
    const { hasRoutePermission } = useSafePagePermissions();
    return hasRoutePermission(routePath, action) ? createElement(Component, props) : denied("You do not have permission to access this page.");
  };