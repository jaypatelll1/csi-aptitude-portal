import React from "react";
import { Route, Routes } from "react-router-dom";
// import { useSelector } from "react-redux";

// Pages
import Login from "./pages/Login";

import MCQExamPage from "./pages/student/Stu_MCQExamPage";
import ResetPassword from "./pages/student/Stu_ResetPassword";
import Stu_Dashboard from "./pages/student/Stu_Dashboard";
import Stu_UpcomingTest from "./pages/student/Stu_UpcomingTest";
import Stu_TestInstruction from "./pages/student/Stu_TestInstruction";
import Stu_Analytics from "./pages/student/Stu_Analytics";
import Stu_Result from "./pages/student/Stu_Result";


import Adm_Dashboard from "./pages/admin/Adm_Dashboard";
import Adm_CreateTestForm from "./pages/admin/Adm_CreateTestForm";
import Adm_DraftTest from "./pages/admin/Adm_DraftTest";
import Adm_ScheduleTest from "./pages/admin/Adm_ScheduleTest";
import Adm_PastTest from "./pages/admin/Adm_PastTest";
import Adm_LiveTest from "./pages/admin/Adm_LiveTest";
import Adm_InputQuestions from "./pages/admin/Adm_InputQuestions";
import Adm_ViewQuestions from "./pages/admin/Adm_ViewQuestions";
import Adm_StudentList from "./pages/admin/Adm_StudentList";
import Adm_TestStudentList from "./pages/admin/Adm_TestStudentList";
import Adm_Analytics from "./pages/admin/Adm_Analytics";
import Adm_StudentAnalysis from "./pages/admin/Adm_StudentAnalysis";
import Adm_StudentAnalytics from "./pages/admin/Adm_StudentAnalytics";

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
import Dep_Analytics from "./pages/department/Dep_Analytics";
import Dep_StudentAnalysis from "./pages/department/Dep_StudentAnalysis";
import Dep_StudentAnalytics from "./pages/department/Dep_StudentAnalytics";


import Teacher_Dashboard from "./pages/teacher/Teacher_Dashboard";
import Teacher_TestInstruction from "./pages/teacher/Teacher_TestInstruction";
import Teacher_MCQExamPage from "./pages/teacher/Teacher_MCQExamPage";
import Teacher_UpcomingTest from "./pages/teacher/Teacher_UpcomingTest";
import Teacher_Result from "./pages/teacher/Teacher_Result";
import Adm_OverallScore from "./pages/admin/Adm_OverallScore";


import Dep_PresidentDashboard from "./pages/depPresident/Dep_PresidentDashboard";
import Dep_PresidentCreateTestForm from "./pages/depPresident/Dep_PresidentCreateTestForm";
import Dep_PresidentDraftTest from "./pages/depPresident/Dep_PresidentDraftTest";
import Dep_PresidentLiveTest from "./pages/depPresident/Dep_PresidentLiveTest";
import Dep_PresidentPastTest from "./pages/depPresident/Dep_PresidentPastTest";
import Dep_PresidentScheduleTest from "./pages/depPresident/Dep_PresidentScheduleTest";
import Dep_PresidentInputQuestions from "./pages/depPresident/Dep_PresidentInputQuestions";
import Dep_PresidentTeacherList from "./pages/depPresident/Dep_PresidentTeacherList";
import Dep_PresidentTestTeacherList from "./pages/depPresident/Dep_PresidentTestStudentList";
import Dep_PresidentViewQuestions from "./pages/depPresident/Dep_PresidentViewQuestions";

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
            <Stu_Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/test-instruction"
        element={
          <ProtectedRoute allowedRoles={["Student"]}>
            <Stu_TestInstruction />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exam"
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
      <Route
        path="/results"
        element={
          <ProtectedRoute allowedRoles={["Student"]}>
            <Stu_Result />
          </ProtectedRoute>
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={["Teacher"]}>
            <Teacher_Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/test-instruction"
        element={
          <ProtectedRoute allowedRoles={["Teacher"]}>
            <Teacher_TestInstruction />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exam/:examId"
        element={
          <ProtectedRoute allowedRoles={["Teacher"]}>
            <Teacher_MCQExamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upcoming-tests"
        element={
          <ProtectedRoute allowedRoles={["Teacher"]}>
            <Teacher_UpcomingTest />
          </ProtectedRoute>
        }
      />
      {/* <Route
        path="/analytics/:user_id"
        element={
          <ProtectedRoute allowedRoles={["Student"]}>
            <Stu_Analytics />
          </ProtectedRoute>
        }
      /> */}
      <Route
        path="/results"
        element={
          <ProtectedRoute allowedRoles={["Teacher"]}>
            <Teacher_Result />
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
            <Adm_TestStudentList />
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
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={["TPO"]}>
            <Adm_Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/student-analysis"
        element={
          <ProtectedRoute allowedRoles={["TPO"]}>
            <Adm_StudentAnalysis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/student-analytics"
        element={
          <ProtectedRoute allowedRoles={["TPO"]}>
            <Adm_StudentAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/overall-score"
        element={
          <ProtectedRoute allowedRoles={["TPO"]}>
            <Adm_OverallScore />
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
        path="/department/past-tests"
        element={
          <ProtectedRoute allowedRoles={["Department"]}>
            <Dep_PastTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/department/scheduled-tests"
        element={
          <ProtectedRoute allowedRoles={["Department"]}>
            <Dep_ScheduleTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/department/input"
        element={
          <ProtectedRoute allowedRoles={["Department"]}>
            <Dep_InputQuestions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/department/studentlist"
        element={
          <ProtectedRoute allowedRoles={["Department"]}>
            <Dep_StudentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/department/test-students"
        element={
          <ProtectedRoute allowedRoles={["Department"]}>
            <Dep_TestStudentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/department/viewquestions"
        element={
          <ProtectedRoute allowedRoles={["Department"]}>
            <Dep_ViewQuestions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/department/analytics"
        element={
          <ProtectedRoute allowedRoles={["Department"]}>
            <Dep_Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/department/student-analysis"
        element={
          <ProtectedRoute allowedRoles={["Department"]}>
            <Dep_StudentAnalysis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/department/student-analytics"
        element={
          <ProtectedRoute allowedRoles={["Department"]}>
            <Dep_StudentAnalytics />
          </ProtectedRoute>
        }
      />


      {/* Department President Routes */}
      <Route
        path="/president"
        element={
          <ProtectedRoute allowedRoles={["President"]}>
            <Dep_PresidentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/president/createtest"
        element={
          <ProtectedRoute allowedRoles={["President"]}>
            <Dep_PresidentCreateTestForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/president/drafted-tests"
        element={
          <ProtectedRoute allowedRoles={["President"]}>
            <Dep_PresidentDraftTest />
          </ProtectedRoute>
        }
      />

      <Route
        path="/president/live-tests"
        element={
          <ProtectedRoute allowedRoles={["President"]}>
            <Dep_PresidentLiveTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/president/past-tests"
        element={
          <ProtectedRoute allowedRoles={["President"]}>
            <Dep_PresidentPastTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/president/scheduled-tests"
        element={
          <ProtectedRoute allowedRoles={["President"]}>
            <Dep_PresidentScheduleTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/president/input"
        element={
          <ProtectedRoute allowedRoles={["President"]}>
            <Dep_PresidentInputQuestions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/president/teacherlist"
        element={
          <ProtectedRoute allowedRoles={["President"]}>
            <Dep_PresidentTeacherList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/president/test-teachers"
        element={
          <ProtectedRoute allowedRoles={["President"]}>
            <Dep_PresidentTestTeacherList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/president/viewquestions"
        element={
          <ProtectedRoute allowedRoles={["President"]}>
            <Dep_PresidentViewQuestions />
          </ProtectedRoute>
        }
      />

      <Route path="/reset-password/:resettoken" element={<ResetPassword />} />
    </Routes>
  );
};

export default AppRoutes;
