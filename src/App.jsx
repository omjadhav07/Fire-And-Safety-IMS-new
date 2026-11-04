import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Layout from "./layout/Layout";
import Dashboard from "./pages/dashboard/Dashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ManageUsers from "./pages/users/ManageUsers";
import ForgotPassword  from "./pages/auth/ForgotPassword";   
import ResetPassword from "./pages/auth/ResetPassword"
import ManageCourses from "./pages/courses/ManageCourses";
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
import ManageCategories from "./pages/library/ManageCategories";
import ManageBooks from "./pages/library/ManageBooks";
import BookIssues from "./pages/library/BookIssues";
import StudentHistory from "./pages/library/StudentHistory";

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

// Public Route Component - Redirects to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (token && isLoggedIn === "true") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - No authentication needed */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* ADD THESE TWO ROUTES HERE */}
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />

        {/* Protected Routes - Require authentication */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="users/add-user" element={<Register />} />
          <Route path="courses" element={<ManageCourses />} />
          <Route path="courses/:id/fees" element={<CourseFees />} />
          <Route path="courses/:id/batches" element={<CourseBatches />} />
          <Route path="library" element={<Navigate to="/library/books" replace />} />
          <Route path="library/categories" element={<ManageCategories />} />
          <Route path="library/books" element={<ManageBooks />} />
          <Route path="library/issues" element={<BookIssues />} />
          <Route path="library/students/:studentId/history" element={<StudentHistory />} />
          <Route path="faculty-assignments" element={<ManageFacultyAssignments />} />
          <Route path="class-schedules" element={<ManageSchedules />} />
          <Route path="class-tests" element={<ManageClassTests />} />
          <Route path="class-tests/:testId" element={<ClassTestMarks />} />
          <Route path="enquiries" element={<ManageEnquiries />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="fees" element={<ManageFees />} />
          <Route path="my-fees" element={<MyFees />} />
          <Route path="notices" element={<ManageNotices />} />
          <Route path="files" element={<MyFiles />} />  
          <Route path="audit-logs" element={<AuditLogs />} />

          {/* Add your other protected routes here as you build them */}
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
