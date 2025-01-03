import React from "react";
import { Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";

// Pages
import Stu_login from "./pages/Login";
import MCQExamPage from "./pages/student/MCQExamPage";
import Adm_Dashboard from "./pages/admin/Adm_Dashboard";
import Adm_CreateTestForm from "./pages/admin/Adm_CreateTestForm";
import Adm_DraftTest from "./pages/admin/Adm_DraftTest";
import Adm_ScheduleTest from "./pages/admin/Adm_ScheduleTest";
import Adm_PastTest from "./pages/admin/Adm_PastTest";
import Adm_InputQuestions from "./pages/admin/Adm_InputQuestions";
import Adm_ViewQuestions from "./pages/admin/Adm_ViewQuestions";
import StudentList from "./pages/admin/Adm_StudentList";
import StudentDashboard from "./pages/student/Stu_Dashboard";
import TestInstruction from "./pages/student/Stu_TestInstruction";
import ResetPassword from "./pages/student/Stu_ResetPassword";


// Protected Route Component
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Stu_login />} />
      
      {/* Student Routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute allowedRoles={["Student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/test-instruction"
        element={
          <ProtectedRoute allowedRoles={["Student"]}>
            <TestInstruction />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exam/:examId"
        element={
          <ProtectedRoute allowedRoles={["Student"]}>
            <MCQExamPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["TPO"]}>
            <Adm_Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/createtest"
        element={
          <ProtectedRoute allowedRoles={["TPO"]}>
            <Adm_CreateTestForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/input"
        element={
          <ProtectedRoute allowedRoles={["TPO"]}>
            <Adm_InputQuestions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/viewquestions"
        element={
          <ProtectedRoute allowedRoles={["TPO"]}>
            <Adm_ViewQuestions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/studentlist"
        element={
          <ProtectedRoute allowedRoles={["TPO"]}>
            <StudentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/drafted-tests"
        element={
          <ProtectedRoute allowedRoles={["TPO"]}>
            <Adm_DraftTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scheduled-tests"
        element={
          <ProtectedRoute allowedRoles={["TPO"]}>
            <Adm_ScheduleTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/past-tests"
        element={
          <ProtectedRoute allowedRoles={["TPO"]}>
            <Adm_PastTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <ProtectedRoute allowedRoles={["Student"]}>
            <ResetPassword />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
