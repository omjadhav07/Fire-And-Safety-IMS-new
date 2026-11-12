// import { LayoutDashboard, Users, GraduationCap, Library, Megaphone, UserCheck, ClipboardList, ClipboardCheck, Award, FileText, IndianRupee, Wallet, FolderOpen, ScrollText } from 'lucide-react';
// import { canAccess } from '../config/permissions';

// // Add new modules here as they are built.
// // "access" is a page key from config/permissions.js: the item shows only for roles allowed there.
// // "roles" is a fixed list of roles, for pages that are not in permissions.js yet.
// export const MENU = [
//   { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', access: 'dashboard' },
//   {
//     label: 'User Management',
//     icon: Users,
//     access: 'users',
//     children: [
//       { label: 'All Users', path: '/users' },
//       // { label: 'Add User', path: '/users/add-user' },
//     ],
//   },
//   {
//     label: 'Course Master',
//     icon: GraduationCap,
//     children: [
//       { label: 'Courses', path: '/courses', access: 'courses' },
//       { label: 'Faculty Assignments', path: '/faculty-assignments', access: 'facultyAssignments' },
//       { label: 'Class Schedules', path: '/class-schedules', access: 'classSchedules' },
//       { label: 'Results', path: '/results', access: 'examResults' },
//       { label: 'TC / LC', path: '/tc-lc', roles: ['super_admin', 'office_staff'] },
//     ],
//   },
//   { label: 'Class Tests', icon: ClipboardCheck, path: '/class-tests', access: 'classTests' },
//   { label: 'Exams', icon: Award, path: '/exam-results', access: 'examResults' },
//   { label: 'Enquiries', icon: ClipboardList, path: '/enquiries', access: 'enquiries' },
//   { label: 'Students', icon: UserCheck, path: '/students', access: 'students' },
//   { label: 'Fees', icon: IndianRupee, path: '/fees', access: 'fees' },
//   { label: 'My Fees', icon: Wallet, path: '/my-fees', access: 'myFees' },
//   { label: 'My TC / LC', icon: FileText, path: '/my-tc-lc', roles: ['student'] },
//   {
//     label: 'Library',
//     icon: Library,
//     access: 'library',
//     children: [
//       { label: 'Books', path: '/library/books' },
//       { label: 'Categories', path: '/library/categories' },
//       { label: 'Book Issues', path: '/library/issues' },
//     ],
//   },
//   { label: 'Notices', icon: Megaphone, path: '/notices', access: 'notices' },
//   { label: 'My Files', icon: FolderOpen, path: '/files', access: 'files' },
//   { label: 'Audit Logs', icon: ScrollText, path: '/audit-logs', access: 'auditLogs' },
// ];

// // Menu for one role: drop what the role may not open, and groups that end up empty
// export const menuForRole = (role) => {
//   const ok = (item) => (!item.access || canAccess(role, item.access)) && (!item.roles || item.roles.includes(role));
//   return MENU.filter(ok)
//     .map((m) => (m.children ? { ...m, children: m.children.filter(ok) } : m))
//     .filter((m) => !m.children || m.children.length > 0);
// };


// // Flat list of pages the role may open (used by the header "Search pages")
// export const pagesForRole = (role) =>
//   menuForRole(role).flatMap((m) =>
//     m.children ? m.children.map((c) => ({ label: c.label, group: m.label, path: c.path })) : [{ label: m.label, group: 'Menu', path: m.path }]
//   );



// import { LayoutDashboard, Users, GraduationCap, Library, Megaphone, UserCheck, ClipboardList, ClipboardCheck, Award, FileText, IndianRupee, Wallet, FolderOpen, ScrollText } from 'lucide-react';
// import { canAccess } from '../config/permissions';

// // Add new modules here as they are built.
// // "access" is a page key from config/permissions.js: the item shows only for roles allowed there.
// // "roles" is a fixed list of roles, for pages that are not in permissions.js yet.
// export const MENU = [
//   { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', access: 'dashboard' },
//   {
//     label: 'User Management',
//     icon: Users,
//     access: 'users',
//     children: [
//       { label: 'All Users', path: '/users' },
//       // { label: 'Add User', path: '/users/add-user' },
//     ],
//   },
//   {
//     label: 'Course Master',
//     icon: GraduationCap,
//     children: [
//       { label: 'Courses', path: '/courses', access: 'courses' },
//       { label: 'Faculty Assignments', path: '/faculty-assignments', access: 'facultyAssignments' },
//       { label: 'Class Schedules', path: '/class-schedules', access: 'classSchedules' },
//       { label: 'Results', path: '/results', access: 'examResults' },
//       { label: 'TC / LC', path: '/tc-lc', roles: ['super_admin', 'office_staff'] },
//     ],
//   },
//   { label: 'Study Material', icon: FolderOpen, path: '/study-material', access: 'studyMaterial' },
//   { label: 'Class Tests', icon: ClipboardCheck, path: '/class-tests', access: 'classTests' },
//   { label: 'Exams', icon: Award, path: '/exam-results', access: 'examResults' },
//   { label: 'Enquiries', icon: ClipboardList, path: '/enquiries', access: 'enquiries' },
//   { label: 'Students', icon: UserCheck, path: '/students', access: 'students' },
//   { label: 'Fees', icon: IndianRupee, path: '/fees', access: 'fees' },
//   { label: 'My Fees', icon: Wallet, path: '/my-fees', access: 'myFees' },
//   { label: 'My TC / LC', icon: FileText, path: '/my-tc-lc', roles: ['student'] },
//   {
//     label: 'Library',
//     icon: Library,
//     access: 'library',
//     children: [
//       { label: 'Books', path: '/library/books' },
//       { label: 'Categories', path: '/library/categories' },
//       { label: 'Book Issues', path: '/library/issues' },
//     ],
//   },
//   { label: 'Notices', icon: Megaphone, path: '/notices', access: 'notices' },
//   { label: 'My Files', icon: FolderOpen, path: '/files', access: 'files' },
//   { label: 'Audit Logs', icon: ScrollText, path: '/audit-logs', access: 'auditLogs' },
// ];

// // Menu for one role: drop what the role may not open, and groups that end up empty
// export const menuForRole = (role) => {
//   const ok = (item) => (!item.access || canAccess(role, item.access)) && (!item.roles || item.roles.includes(role));
//   return MENU.filter(ok)
//     .map((m) => (m.children ? { ...m, children: m.children.filter(ok) } : m))
//     .filter((m) => !m.children || m.children.length > 0);
// };


// // Flat list of pages the role may open (used by the header "Search pages")
// export const pagesForRole = (role) =>
//   menuForRole(role).flatMap((m) =>
//     m.children ? m.children.map((c) => ({ label: c.label, group: m.label, path: c.path })) : [{ label: m.label, group: 'Menu', path: m.path }]
//   );


import { LayoutDashboard, Users, GraduationCap, Library, Megaphone, UserCheck, ClipboardList, ClipboardCheck, Award, FileText, IndianRupee, Wallet, FolderOpen, ScrollText } from 'lucide-react';
import { canAccess } from '../config/permissions';

// Add new modules here as they are built.
// "access" is a page key from config/permissions.js: the item shows only for roles allowed there.
// "roles" is a fixed list of roles, for pages that are not in permissions.js yet.
export const MENU = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', access: 'dashboard' },
  {
    label: 'User Management',
    icon: Users,
    access: 'users',
    children: [
      { label: 'All Users', path: '/users' },
      // { label: 'Add User', path: '/users/add-user' },
    ],
  },
  {
    label: 'Course Master',
    icon: GraduationCap,
    children: [
      { label: 'Courses', path: '/courses', access: 'courses' },
      { label: 'Faculty Assignments', path: '/faculty-assignments', access: 'facultyAssignments' },
      { label: 'Class Schedules', path: '/class-schedules', access: 'classSchedules' },
      { label: 'Results', path: '/results', access: 'examResults' },
      { label: 'TC / LC', path: '/tc-lc', roles: ['super_admin', 'office_staff'] },
    ],
  },
  { label: 'Study Material', icon: FolderOpen, path: '/study-material', access: 'studyMaterial' },
  { label: 'Class Tests', icon: ClipboardCheck, path: '/class-tests', access: 'classTests' },
  { label: 'Exam Forms', icon: FileText, path: '/exam-forms', access: 'examForms' },
  { label: 'Exams', icon: Award, path: '/exam-results', access: 'examResults' },
  { label: 'Enquiries', icon: ClipboardList, path: '/enquiries', access: 'enquiries' },
  { label: 'Students', icon: UserCheck, path: '/students', access: 'students' },
  { label: 'Fees', icon: IndianRupee, path: '/fees', access: 'fees' },
  { label: 'My Fees', icon: Wallet, path: '/my-fees', access: 'myFees' },
  { label: 'My TC / LC', icon: FileText, path: '/my-tc-lc', roles: ['student'] },
  {
    label: 'Library',
    icon: Library,
    access: 'library',
    children: [
      { label: 'Books', path: '/library/books' },
      { label: 'Categories', path: '/library/categories' },
      { label: 'Book Issues', path: '/library/issues' },
    ],
  },
  { label: 'Notices', icon: Megaphone, path: '/notices', access: 'notices' },
  { label: 'My Files', icon: FolderOpen, path: '/files', access: 'files' },
  { label: 'Audit Logs', icon: ScrollText, path: '/audit-logs', access: 'auditLogs' },
];

// Menu for one role: drop what the role may not open, and groups that end up empty
export const menuForRole = (role) => {
  const ok = (item) => (!item.access || canAccess(role, item.access)) && (!item.roles || item.roles.includes(role));
  return MENU.filter(ok)
    .map((m) => (m.children ? { ...m, children: m.children.filter(ok) } : m))
    .filter((m) => !m.children || m.children.length > 0);
};


// Flat list of pages the role may open (used by the header "Search pages")
export const pagesForRole = (role) =>
  menuForRole(role).flatMap((m) =>
    m.children ? m.children.map((c) => ({ label: c.label, group: m.label, path: c.path })) : [{ label: m.label, group: 'Menu', path: m.path }]
  );