
// import React from "react";
// import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
// import { canAccess, getCurrentRole } from "./config/permissions";

// import Layout from "./layout/Layout";
// import Dashboard from "./pages/dashboard/Dashboard";
// import Login from "./pages/auth/Login";
// import Register from "./pages/auth/Register";
// import ManageUsers from "./pages/users/ManageUsers";
// import ManageRoles from "./pages/roles/ManageRoles";
// import ForgotPassword from "./pages/auth/ForgotPassword";
// import ResetPassword from "./pages/auth/ResetPassword";
// import ManageCourses from "./pages/courses/ManageCourses";
// import CourseFees from "./pages/courses/CourseFees";
// import CourseBatches from "./pages/courses/CourseBatches";
// import MyFiles from "./pages/files/MyFiles";
// import AuditLogs from "./pages/audit/AuditLogs";
// import ManageNotices from "./pages/notices/ManageNotices";
// import ManageStudents from "./pages/students/ManageStudents";
// import ManageEnquiries from "./pages/enquiries/ManageEnquiries";
// import ManageFees from "./pages/fees/ManageFees";
// import MyFees from "./pages/fees/MyFees";
// import ManageFacultyAssignments from "./pages/faculty/ManageFacultyAssignments";
// import ManageSchedules from "./pages/schedules/ManageSchedules";
// import ManageClassTests from "./pages/classTests/ManageClassTests";
// import ClassTestMarks from "./pages/classTests/ClassTestMarks";
// import ManageExams from "./pages/exams/ManageExams";
// import ManageExamForms from "./pages/examForms/ManageExamForms";
// import ExamMarks from "./pages/exams/ExamMarks";
// import ResultsHome from "./pages/exams/ResultsHome";
// import ManageTcLc from "./pages/tclc/ManageTcLc";
// import MyTcLc from "./pages/tclc/MyTcLc";
// import ManageCategories from "./pages/library/ManageCategories";
// import ManageBooks from "./pages/library/ManageBooks";
// import BookIssues from "./pages/library/BookIssues";
// import StudentHistory from "./pages/library/StudentHistory";
// import ManageMaterials from "./pages/materials/ManageMaterials";

// // Roles for the TC / LC pages
// const TC_LC_ROLES = ["super_admin", "office_staff"];
// const STUDENT_ROLES = ["student"];

// // Protected Route Component
// const PrivateRoute = ({ children }) => {
//   const location = useLocation();
//   const token = localStorage.getItem("token");
//   const isLoggedIn = localStorage.getItem("isLoggedIn");

//   if (!token || isLoggedIn !== "true") {
//     return <Navigate to="/login" replace state={{ from: location }} />;
//   }

//   return children;
// };

// // Public Route Component
// const PublicRoute = ({ children }) => {
//   const token = localStorage.getItem("token");
//   const isLoggedIn = localStorage.getItem("isLoggedIn");

//   if (token && isLoggedIn === "true") {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// };

// // Role Route Component
// const RoleRoute = ({ access, roles, children }) => {
//   const role = getCurrentRole();
//   const allowed = roles ? roles.includes(role) : canAccess(role, access);
  
//   if (allowed) return children;
  
//   return (
//     <div className="max-w-md mx-auto mt-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
//       <h1 className="text-xl font-bold text-gray-900">No access</h1>
//       <p className="text-sm text-gray-500 mt-2">Your role does not have permission to open this page.</p>
//       <Link
//         to="/dashboard"
//         className="inline-block mt-5 px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7]"
//       >
//         Back to dashboard
//       </Link>
//     </div>
//   );
// };

// const App = () => {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Public Routes */}
//         <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
//         <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
//         <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

//         {/* Protected Routes */}
//         <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
//           <Route index element={<Navigate to="/dashboard" replace />} />
//           <Route path="dashboard" element={<Dashboard />} />
          
//           <Route path="users" element={<RoleRoute access="users"><ManageUsers /></RoleRoute>} />
//           <Route path="users/add-user" element={<RoleRoute access="users"><Register /></RoleRoute>} />
//           <Route path="roles" element={<RoleRoute access="users"><ManageRoles /></RoleRoute>} />
          
//           <Route path="courses" element={<RoleRoute access="courses"><ManageCourses /></RoleRoute>} />
//           <Route path="courses/:id/fees" element={<RoleRoute access="courses"><CourseFees /></RoleRoute>} />
//           <Route path="courses/:id/batches" element={<RoleRoute access="courses"><CourseBatches /></RoleRoute>} />
          
//           <Route path="library" element={<Navigate to="/library/books" replace />} />
//           <Route path="library/categories" element={<RoleRoute access="library"><ManageCategories /></RoleRoute>} />
//           <Route path="library/books" element={<RoleRoute access="library"><ManageBooks /></RoleRoute>} />
//           <Route path="library/issues" element={<RoleRoute access="library"><BookIssues /></RoleRoute>} />
//           <Route path="library/students/:studentId/history" element={<RoleRoute access="library"><StudentHistory /></RoleRoute>} />
          
//           <Route path="faculty-assignments" element={<RoleRoute access="facultyAssignments"><ManageFacultyAssignments /></RoleRoute>} />
//           <Route path="class-schedules" element={<RoleRoute access="classSchedules"><ManageSchedules /></RoleRoute>} />
          
//           <Route path="study-material" element={<RoleRoute access="studyMaterial"><ManageMaterials /></RoleRoute>} />

//           <Route path="class-tests" element={<RoleRoute access="classTests"><ManageClassTests /></RoleRoute>} />
//           <Route path="class-tests/:testId" element={<RoleRoute access="classTests"><ClassTestMarks /></RoleRoute>} />
          
//           {/* EXAMS ROUTING */}
//           <Route path="exams" element={<RoleRoute access="examResults"><ManageExams /></RoleRoute>} />
//           <Route path="exam-results" element={<RoleRoute access="examResults"><ManageExams /></RoleRoute>} />
          
//           <Route path="exams/:examId" element={<RoleRoute access="examResults"><ExamMarks /></RoleRoute>} />
//           <Route path="exams/:examId/results" element={<RoleRoute access="examResults"><ExamMarks /></RoleRoute>} />
          
//           {/* Added Exam Forms route to match Sidebar (Point this to your actual ExamForms component if you have one) */}
//           <Route path="exam-forms" element={<RoleRoute access="examForms"><ManageExamForms /></RoleRoute>} />

//           <Route path="results" element={<RoleRoute access="examResults"><ResultsHome /></RoleRoute>} />
          
//           <Route path="tc-lc" element={<RoleRoute roles={TC_LC_ROLES}><ManageTcLc /></RoleRoute>} />
//           <Route path="my-tc-lc" element={<RoleRoute roles={STUDENT_ROLES}><MyTcLc /></RoleRoute>} />
          
//           <Route path="enquiries" element={<RoleRoute access="enquiries"><ManageEnquiries /></RoleRoute>} />
//           <Route path="students" element={<RoleRoute access="students"><ManageStudents /></RoleRoute>} />
//           <Route path="fees" element={<RoleRoute access="fees"><ManageFees /></RoleRoute>} />
//           <Route path="my-fees" element={<RoleRoute access="myFees"><MyFees /></RoleRoute>} />
          
//           <Route path="notices" element={<ManageNotices />} />
//           <Route path="files" element={<MyFiles />} />
//           <Route path="audit-logs" element={<RoleRoute access="auditLogs"><AuditLogs /></RoleRoute>} />
//         </Route>

//         {/* Catch all route */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default App;




// import React from "react";
// import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
// import { canAccess, getCurrentRole, useUserRefresh } from "./config/permissions";

// import Layout from "./layout/Layout";
// import Dashboard from "./pages/dashboard/Dashboard";
// import Login from "./pages/auth/Login";
// import Register from "./pages/auth/Register";
// import ManageUsers from "./pages/users/ManageUsers";
// import ManageRoles from "./pages/roles/ManageRoles";
// import ForgotPassword from "./pages/auth/ForgotPassword";
// import ResetPassword from "./pages/auth/ResetPassword";
// import ManageCourses from "./pages/courses/ManageCourses";
// import CourseFees from "./pages/courses/CourseFees";
// import CourseBatches from "./pages/courses/CourseBatches";
// import MyFiles from "./pages/files/MyFiles";
// import AuditLogs from "./pages/audit/AuditLogs";
// import ManageNotices from "./pages/notices/ManageNotices";
// import ManageStudents from "./pages/students/ManageStudents";
// import ManageEnquiries from "./pages/enquiries/ManageEnquiries";
// import ManageFees from "./pages/fees/ManageFees";
// import MyFees from "./pages/fees/MyFees";
// import ManageFacultyAssignments from "./pages/faculty/ManageFacultyAssignments";
// import ManageSchedules from "./pages/schedules/ManageSchedules";
// import ManageClassTests from "./pages/classTests/ManageClassTests";
// import ClassTestMarks from "./pages/classTests/ClassTestMarks";
// import ManageExams from "./pages/exams/ManageExams";
// import ManageExamForms from "./pages/examForms/ManageExamForms";
// import ExamMarks from "./pages/exams/ExamMarks";
// import ResultsHome from "./pages/exams/ResultsHome";
// import ManageTcLc from "./pages/tclc/ManageTcLc";
// import MyTcLc from "./pages/tclc/MyTcLc";
// import ManageCategories from "./pages/library/ManageCategories";
// import ManageBooks from "./pages/library/ManageBooks";
// import BookIssues from "./pages/library/BookIssues";
// import StudentHistory from "./pages/library/StudentHistory";
// import ManageMaterials from "./pages/materials/ManageMaterials";

// // Roles for the TC / LC pages
// const TC_LC_ROLES = ["super_admin", "office_staff"];
// const STUDENT_ROLES = ["student"];

// // Protected Route Component
// const PrivateRoute = ({ children }) => {
//   const location = useLocation();
//   const token = localStorage.getItem("token");
//   const isLoggedIn = localStorage.getItem("isLoggedIn");

//   if (!token || isLoggedIn !== "true") {
//     return <Navigate to="/login" replace state={{ from: location }} />;
//   }

//   return children;
// };

// // Public Route Component
// const PublicRoute = ({ children }) => {
//   const token = localStorage.getItem("token");
//   const isLoggedIn = localStorage.getItem("isLoggedIn");

//   if (token && isLoggedIn === "true") {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// };

// // Role Route Component
// const RoleRoute = ({ access, roles, children }) => {
//   useUserRefresh(); // re-check when the header has loaded the user's permissions
//   const role = getCurrentRole();
//   const allowed = roles ? roles.includes(role) : canAccess(role, access);
  
//   if (allowed) return children;
  
//   return (
//     <div className="max-w-md mx-auto mt-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
//       <h1 className="text-xl font-bold text-gray-900">No access</h1>
//       <p className="text-sm text-gray-500 mt-2">Your role does not have permission to open this page.</p>
//       <Link
//         to="/dashboard"
//         className="inline-block mt-5 px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7]"
//       >
//         Back to dashboard
//       </Link>
//     </div>
//   );
// };

// const App = () => {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Public Routes */}
//         <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
//         <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
//         <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

//         {/* Protected Routes */}
//         <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
//           <Route index element={<Navigate to="/dashboard" replace />} />
//           <Route path="dashboard" element={<Dashboard />} />
          
//           <Route path="users" element={<RoleRoute access="users"><ManageUsers /></RoleRoute>} />
//           <Route path="users/add-user" element={<RoleRoute access="users"><Register /></RoleRoute>} />
//           <Route path="roles" element={<RoleRoute access="users"><ManageRoles /></RoleRoute>} />
          
//           <Route path="courses" element={<RoleRoute access="courses"><ManageCourses /></RoleRoute>} />
//           <Route path="courses/:id/fees" element={<RoleRoute access="courses"><CourseFees /></RoleRoute>} />
//           <Route path="courses/:id/batches" element={<RoleRoute access="courses"><CourseBatches /></RoleRoute>} />
          
//           <Route path="library" element={<Navigate to="/library/books" replace />} />
//           <Route path="library/categories" element={<RoleRoute access="library"><ManageCategories /></RoleRoute>} />
//           <Route path="library/books" element={<RoleRoute access="library"><ManageBooks /></RoleRoute>} />
//           <Route path="library/issues" element={<RoleRoute access="library"><BookIssues /></RoleRoute>} />
//           <Route path="library/students/:studentId/history" element={<RoleRoute access="library"><StudentHistory /></RoleRoute>} />
          
//           <Route path="faculty-assignments" element={<RoleRoute access="facultyAssignments"><ManageFacultyAssignments /></RoleRoute>} />
//           <Route path="class-schedules" element={<RoleRoute access="classSchedules"><ManageSchedules /></RoleRoute>} />
          
//           <Route path="study-material" element={<RoleRoute access="studyMaterial"><ManageMaterials /></RoleRoute>} />

//           <Route path="class-tests" element={<RoleRoute access="classTests"><ManageClassTests /></RoleRoute>} />
//           <Route path="class-tests/:testId" element={<RoleRoute access="classTests"><ClassTestMarks /></RoleRoute>} />
          
//           {/* EXAMS ROUTING */}
//           <Route path="exams" element={<RoleRoute access="examResults"><ManageExams /></RoleRoute>} />
//           <Route path="exam-results" element={<RoleRoute access="examResults"><ManageExams /></RoleRoute>} />
          
//           <Route path="exams/:examId" element={<RoleRoute access="examResults"><ExamMarks /></RoleRoute>} />
//           <Route path="exams/:examId/results" element={<RoleRoute access="examResults"><ExamMarks /></RoleRoute>} />
          
//           {/* Added Exam Forms route to match Sidebar (Point this to your actual ExamForms component if you have one) */}
//           <Route path="exam-forms" element={<RoleRoute access="examForms"><ManageExamForms /></RoleRoute>} />

//           <Route path="results" element={<RoleRoute access="examResults"><ResultsHome /></RoleRoute>} />
          
//           <Route path="tc-lc" element={<RoleRoute access="tcLc"><ManageTcLc /></RoleRoute>} />
//           <Route path="my-tc-lc" element={<RoleRoute roles={STUDENT_ROLES}><MyTcLc /></RoleRoute>} />
          
//           <Route path="enquiries" element={<RoleRoute access="enquiries"><ManageEnquiries /></RoleRoute>} />
//           <Route path="students" element={<RoleRoute access="students"><ManageStudents /></RoleRoute>} />
//           <Route path="fees" element={<RoleRoute access="fees"><ManageFees /></RoleRoute>} />
//           <Route path="my-fees" element={<RoleRoute access="myFees"><MyFees /></RoleRoute>} />
          
//           <Route path="notices" element={<ManageNotices />} />
//           <Route path="files" element={<MyFiles />} />
//           <Route path="audit-logs" element={<RoleRoute access="auditLogs"><AuditLogs /></RoleRoute>} />
//         </Route>

//         {/* Catch all route */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default App;

// nov 14



// import React from "react";
// import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
// import { canAccess, getCurrentRole, useUserRefresh } from "./config/permissions";

// import Layout from "./layout/Layout";
// import Dashboard from "./pages/dashboard/Dashboard";
// import Login from "./pages/auth/Login";
// import Register from "./pages/auth/Register";
// import ManageUsers from "./pages/users/ManageUsers";
// import ManageRoles from "./pages/roles/ManageRoles";
// import ForgotPassword from "./pages/auth/ForgotPassword";
// import ResetPassword from "./pages/auth/ResetPassword";
// import ManageCourses from "./pages/courses/ManageCourses";
// import ManageSubjects from "./pages/subjects/ManageSubjects";
// import CourseFees from "./pages/courses/CourseFees";
// import CourseBatches from "./pages/courses/CourseBatches";
// import MyFiles from "./pages/files/MyFiles";
// import AuditLogs from "./pages/audit/AuditLogs";
// import ManageNotices from "./pages/notices/ManageNotices";
// import ManageStudents from "./pages/students/ManageStudents";
// import ManageEnquiries from "./pages/enquiries/ManageEnquiries";
// import ManageFees from "./pages/fees/ManageFees";
// import MyFees from "./pages/fees/MyFees";
// import ManageFacultyAssignments from "./pages/faculty/ManageFacultyAssignments";
// import ManageSchedules from "./pages/schedules/ManageSchedules";
// import ManageClassTests from "./pages/classTests/ManageClassTests";
// import ClassTestMarks from "./pages/classTests/ClassTestMarks";
// import ManageExams from "./pages/exams/ManageExams";
// import ManageExamForms from "./pages/examForms/ManageExamForms";
// import ExamMarks from "./pages/exams/ExamMarks";
// import ResultsHome from "./pages/exams/ResultsHome";
// import ManageTcLc from "./pages/tclc/ManageTcLc";
// import MyTcLc from "./pages/tclc/MyTcLc";
// import ManageCategories from "./pages/library/ManageCategories";
// import ManageBooks from "./pages/library/ManageBooks";
// import BookIssues from "./pages/library/BookIssues";
// import StudentHistory from "./pages/library/StudentHistory";
// import ManageMaterials from "./pages/materials/ManageMaterials";

// // Roles for the TC / LC pages
// const TC_LC_ROLES = ["super_admin", "office_staff"];
// const STUDENT_ROLES = ["student"];

// // Protected Route Component
// const PrivateRoute = ({ children }) => {
//   const location = useLocation();
//   const token = localStorage.getItem("token");
//   const isLoggedIn = localStorage.getItem("isLoggedIn");

//   if (!token || isLoggedIn !== "true") {
//     return <Navigate to="/login" replace state={{ from: location }} />;
//   }

//   return children;
// };

// // Public Route Component
// const PublicRoute = ({ children }) => {
//   const token = localStorage.getItem("token");
//   const isLoggedIn = localStorage.getItem("isLoggedIn");

//   if (token && isLoggedIn === "true") {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// };

// // Role Route Component
// const RoleRoute = ({ access, roles, children }) => {
//   useUserRefresh(); // re-check when the header has loaded the user's permissions
//   const role = getCurrentRole();
//   const allowed = roles ? roles.includes(role) : canAccess(role, access);
  
//   if (allowed) return children;
  
//   return (
//     <div className="max-w-md mx-auto mt-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
//       <h1 className="text-xl font-bold text-gray-900">No access</h1>
//       <p className="text-sm text-gray-500 mt-2">Your role does not have permission to open this page.</p>
//       <Link
//         to="/dashboard"
//         className="inline-block mt-5 px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7]"
//       >
//         Back to dashboard
//       </Link>
//     </div>
//   );
// };

// const App = () => {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Public Routes */}
//         <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
//         <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
//         <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

//         {/* Protected Routes */}
//         <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
//           <Route index element={<Navigate to="/dashboard" replace />} />
//           <Route path="dashboard" element={<Dashboard />} />
          
//           <Route path="users" element={<RoleRoute access="users"><ManageUsers /></RoleRoute>} />
//           <Route path="users/add-user" element={<RoleRoute access="users"><Register /></RoleRoute>} />
//           <Route path="roles" element={<RoleRoute access="users"><ManageRoles /></RoleRoute>} />
          
//           <Route path="courses" element={<RoleRoute access="courses"><ManageCourses /></RoleRoute>} />
//           <Route path="subjects" element={<RoleRoute access="subjects"><ManageSubjects /></RoleRoute>} />
//           <Route path="courses/:id/fees" element={<RoleRoute access="courses"><CourseFees /></RoleRoute>} />
//           <Route path="courses/:id/batches" element={<RoleRoute access="courses"><CourseBatches /></RoleRoute>} />
          
//           <Route path="library" element={<Navigate to="/library/books" replace />} />
//           <Route path="library/categories" element={<RoleRoute access="library"><ManageCategories /></RoleRoute>} />
//           <Route path="library/books" element={<RoleRoute access="library"><ManageBooks /></RoleRoute>} />
//           <Route path="library/issues" element={<RoleRoute access="library"><BookIssues /></RoleRoute>} />
//           <Route path="library/students/:studentId/history" element={<RoleRoute access="library"><StudentHistory /></RoleRoute>} />
          
//           <Route path="faculty-assignments" element={<RoleRoute access="facultyAssignments"><ManageFacultyAssignments /></RoleRoute>} />
//           <Route path="class-schedules" element={<RoleRoute access="classSchedules"><ManageSchedules /></RoleRoute>} />
          
//           <Route path="study-material" element={<RoleRoute access="studyMaterial"><ManageMaterials /></RoleRoute>} />

//           <Route path="class-tests" element={<RoleRoute access="classTests"><ManageClassTests /></RoleRoute>} />
//           <Route path="class-tests/:testId" element={<RoleRoute access="classTests"><ClassTestMarks /></RoleRoute>} />
          
//           {/* EXAMS ROUTING */}
//           <Route path="exams" element={<RoleRoute access="examResults"><ManageExams /></RoleRoute>} />
//           <Route path="exam-results" element={<RoleRoute access="examResults"><ManageExams /></RoleRoute>} />
          
//           <Route path="exams/:examId" element={<RoleRoute access="examResults"><ExamMarks /></RoleRoute>} />
//           <Route path="exams/:examId/results" element={<RoleRoute access="examResults"><ExamMarks /></RoleRoute>} />
          
//           {/* Added Exam Forms route to match Sidebar (Point this to your actual ExamForms component if you have one) */}
//           <Route path="exam-forms" element={<RoleRoute access="examForms"><ManageExamForms /></RoleRoute>} />

//           <Route path="results" element={<RoleRoute access="examResults"><ResultsHome /></RoleRoute>} />
          
//           <Route path="tc-lc" element={<RoleRoute access="tcLc"><ManageTcLc /></RoleRoute>} />
//           <Route path="my-tc-lc" element={<RoleRoute roles={STUDENT_ROLES}><MyTcLc /></RoleRoute>} />
          
//           <Route path="enquiries" element={<RoleRoute access="enquiries"><ManageEnquiries /></RoleRoute>} />
//           <Route path="students" element={<RoleRoute access="students"><ManageStudents /></RoleRoute>} />
//           <Route path="fees" element={<RoleRoute access="fees"><ManageFees /></RoleRoute>} />
//           <Route path="my-fees" element={<RoleRoute access="myFees"><MyFees /></RoleRoute>} />
          
//           <Route path="notices" element={<ManageNotices />} />
//           <Route path="files" element={<MyFiles />} />
//           <Route path="audit-logs" element={<RoleRoute access="auditLogs"><AuditLogs /></RoleRoute>} />
//         </Route>

//         {/* Catch all route */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default App;


// 16 nov

import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { canAccess, getCurrentRole, useUserRefresh } from "./config/permissions";

import Layout from "./layout/Layout";
import Dashboard from "./pages/dashboard/Dashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ManageUsers from "./pages/users/ManageUsers";
import ManageRoles from "./pages/roles/ManageRoles";
import UserPermissions from "./pages/roles/UserPermissions";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ManageCourses from "./pages/courses/ManageCourses";
import ManageSubjects from "./pages/subjects/ManageSubjects";
import CourseFees from "./pages/courses/CourseFees";
import CourseBatches from "./pages/courses/CourseBatches";
import MyFiles from "./pages/files/MyFiles";
import AuditLogs from "./pages/audit/AuditLogs";
import ManageNotices from "./pages/notices/ManageNotices";
import ManageStudents from "./pages/students/ManageStudents";
import ManageEnquiries from "./pages/enquiries/ManageEnquiries";
import ManageFees from "./pages/fees/ManageFees";
import MyFees from "./pages/fees/MyFees";
import ManageFacultyAssignments from "./pages/faculty/ManageFacultyAssignments";
import ManageSchedules from "./pages/schedules/ManageSchedules";
import ManageClassTests from "./pages/classTests/ManageClassTests";
import ClassTestMarks from "./pages/classTests/ClassTestMarks";
import ManageExams from "./pages/exams/ManageExams";
import ManageExamForms from "./pages/examForms/ManageExamForms";
import ExamMarks from "./pages/exams/ExamMarks";
import ResultsHome from "./pages/exams/ResultsHome";
import ManageTcLc from "./pages/tclc/ManageTcLc";
import MyTcLc from "./pages/tclc/MyTcLc";
import ManageCategories from "./pages/library/ManageCategories";
import ManageBooks from "./pages/library/ManageBooks";
import BookIssues from "./pages/library/BookIssues";
import StudentHistory from "./pages/library/StudentHistory";
import ManageMaterials from "./pages/materials/ManageMaterials";

// Roles for the TC / LC pages
const TC_LC_ROLES = ["super_admin", "office_staff"];
const STUDENT_ROLES = ["student"];

// Protected Route Component
const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (!token || isLoggedIn !== "true") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (token && isLoggedIn === "true") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Role Route Component
const RoleRoute = ({ access, roles, children }) => {
  useUserRefresh(); // re-check when the header has loaded the user's permissions
  const role = getCurrentRole();
  const allowed = roles ? roles.includes(role) : canAccess(role, access);
  
  if (allowed) return children;
  
  return (
    <div className="max-w-md mx-auto mt-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
      <h1 className="text-xl font-bold text-gray-900">No access</h1>
      <p className="text-sm text-gray-500 mt-2">Your role does not have permission to open this page.</p>
      <Link
        to="/dashboard"
        className="inline-block mt-5 px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7]"
      >
        Back to dashboard
      </Link>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

        {/* Protected Routes */}
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="users" element={<RoleRoute access="users"><ManageUsers /></RoleRoute>} />
          <Route path="users/add-user" element={<RoleRoute access="users"><Register /></RoleRoute>} />
          <Route path="users/:userId/permissions" element={<RoleRoute access="users"><UserPermissions /></RoleRoute>} />
          <Route path="roles" element={<RoleRoute access="users"><ManageRoles /></RoleRoute>} />
          
          <Route path="courses" element={<RoleRoute access="courses"><ManageCourses /></RoleRoute>} />
          <Route path="subjects" element={<RoleRoute access="subjects"><ManageSubjects /></RoleRoute>} />
          <Route path="courses/:id/fees" element={<RoleRoute access="courses"><CourseFees /></RoleRoute>} />
          <Route path="courses/:id/batches" element={<RoleRoute access="courses"><CourseBatches /></RoleRoute>} />
          
          <Route path="library" element={<Navigate to="/library/books" replace />} />
          <Route path="library/categories" element={<RoleRoute access="library"><ManageCategories /></RoleRoute>} />
          <Route path="library/books" element={<RoleRoute access="library"><ManageBooks /></RoleRoute>} />
          <Route path="library/issues" element={<RoleRoute access="library"><BookIssues /></RoleRoute>} />
          <Route path="library/students/:studentId/history" element={<RoleRoute access="library"><StudentHistory /></RoleRoute>} />
          
          <Route path="faculty-assignments" element={<RoleRoute access="facultyAssignments"><ManageFacultyAssignments /></RoleRoute>} />
          <Route path="class-schedules" element={<RoleRoute access="classSchedules"><ManageSchedules /></RoleRoute>} />
          
          <Route path="study-material" element={<RoleRoute access="studyMaterial"><ManageMaterials /></RoleRoute>} />

          <Route path="class-tests" element={<RoleRoute access="classTests"><ManageClassTests /></RoleRoute>} />
          <Route path="class-tests/:testId" element={<RoleRoute access="classTests"><ClassTestMarks /></RoleRoute>} />
          
          {/* EXAMS ROUTING */}
          <Route path="exams" element={<RoleRoute access="examResults"><ManageExams /></RoleRoute>} />
          <Route path="exam-results" element={<RoleRoute access="examResults"><ManageExams /></RoleRoute>} />
          
          <Route path="exams/:examId" element={<RoleRoute access="examResults"><ExamMarks /></RoleRoute>} />
          <Route path="exams/:examId/results" element={<RoleRoute access="examResults"><ExamMarks /></RoleRoute>} />
          
          {/* Added Exam Forms route to match Sidebar (Point this to your actual ExamForms component if you have one) */}
          <Route path="exam-forms" element={<RoleRoute access="examForms"><ManageExamForms /></RoleRoute>} />

          <Route path="results" element={<RoleRoute access="examResults"><ResultsHome /></RoleRoute>} />
          
          <Route path="tc-lc" element={<RoleRoute access="tcLc"><ManageTcLc /></RoleRoute>} />
          <Route path="my-tc-lc" element={<RoleRoute roles={STUDENT_ROLES}><MyTcLc /></RoleRoute>} />
          
          <Route path="enquiries" element={<RoleRoute access="enquiries"><ManageEnquiries /></RoleRoute>} />
          <Route path="students" element={<RoleRoute access="students"><ManageStudents /></RoleRoute>} />
          <Route path="fees" element={<RoleRoute access="fees"><ManageFees /></RoleRoute>} />
          <Route path="my-fees" element={<RoleRoute access="myFees"><MyFees /></RoleRoute>} />
          
          <Route path="notices" element={<ManageNotices />} />
          <Route path="files" element={<MyFiles />} />
          <Route path="audit-logs" element={<RoleRoute access="auditLogs"><AuditLogs /></RoleRoute>} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;