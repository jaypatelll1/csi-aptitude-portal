import React from "react";
import { Route, Routes } from "react-router-dom";
// import { useSelector } from "react-redux";

// Pages
import Login from "./pages/Login";
import MCQExamPage from "./pages/student/Stu_MCQExamPage";
import StudentDashboard from "./pages/student/Stu_Dashboard";
import ResetPassword from "./pages/student/Stu_ResetPassword";
import Stu_UpcomingTest from "./pages/student/Stu_UpcomingTest";
import TestInstruction from "./pages/student/Stu_TestInstruction";
import Stu_Analytics from "./pages/student/Stu_Analytics";
import Adm_Dashboard from "./pages/admin/Adm_Dashboard";
import Adm_CreateTestForm from "./pages/admin/Adm_CreateTestForm";
import Adm_DraftTest from "./pages/admin/Adm_DraftTest";
import Adm_ScheduleTest from "./pages/admin/Adm_ScheduleTest";
import Adm_PastTest from "./pages/admin/Adm_PastTest";
import Adm_LiveTest from "./pages/admin/Adm_LiveTest";
import Adm_InputQuestions from "./pages/admin/Adm_InputQuestions";
import Adm_ViewQuestions from "./pages/admin/Adm_ViewQuestions";
import Adm_StudentList from "./pages/admin/Adm_StudentList";
import TestStudentList from "./pages/admin/Adm_TestStudentList";

import Dep_Dashboard from "./pages/department/Dep_Dashboard";
import Dep_CreateTestForm from "./pages/department/Dep_CreateTestForm";
import Dep_DraftTest from "./pages/department/Dep_DraftTest";
import Dep_ScheduleTest from "./pages/department/Dep_ScheduleTest";
import Dep_PastTest from "./pages/department/Dep_PastTest";
import Dep_LiveTest from "./pages/department/Dep_LiveTest";
import Dep_InputQuestions from "./pages/department/Dep_InputQuestions";
import Dep_StudentList from "./pages/department/Dep_StudentList";
import Dep_ViewQuestions from "./pages/department/Dep_ViewQuestions";
import Dep_TestStudentList from "./pages/department/Dep_TestStudentList";

// Protected Route Component
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />

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
      <Route
        path="/upcoming-tests"
        element={
          <ProtectedRoute allowedRoles={["Student"]}>
            <Stu_UpcomingTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute allowedRoles={["Student"]}>
            <Stu_Analytics />
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
            <Adm_StudentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teststudentlist"
        element={
          <ProtectedRoute allowedRoles={["TPO"]}>
            <TestStudentList />
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
        path="/live-tests"
        element={
          <ProtectedRoute allowedRoles={["TPO"]}>
            <Adm_LiveTest />
          </ProtectedRoute>
        }
      />

      {/* Department Routes */}
      <Route
        path="/department"
        element={
          <ProtectedRoute allowedRoles={["Department"]}>
            <Dep_Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/department/createtest"
        element={
          <ProtectedRoute allowedRoles={["Department"]}>
            <Dep_CreateTestForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/department/drafted-tests"
        element={
          <ProtectedRoute allowedRoles={["Department"]}>
            <Dep_DraftTest />
          </ProtectedRoute>
        }
      />

      <Route
        path="/department/live-tests"
        element={
          <ProtectedRoute allowedRoles={["Department"]}>
            <Dep_LiveTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/department/past_tests"
        element={
          <ProtectedRoute allowedRoles={["Department"]}>
          < Dep_PastTest/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/department/scheduled-tests"
        element={
          <ProtectedRoute allowedRoles={["Department"]}>
          < Dep_ScheduleTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/department/input"
        element={
          <ProtectedRoute allowedRoles={["Department"]}>
          < Dep_InputQuestions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/department/studentlist"
        element={
          <ProtectedRoute allowedRoles={["Department"]}>
          < Dep_StudentList/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/department/test-students"
        element={
          <ProtectedRoute allowedRoles={["Department"]}>
          < Dep_TestStudentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/department/viewquestions"
        element={
          <ProtectedRoute allowedRoles={["Department"]}>
          < Dep_ViewQuestions/>
          </ProtectedRoute>
        }
      />

      <Route path="/reset-password/:resettoken" element={<ResetPassword />} />
    </Routes>
  );
};

export default AppRoutes;
