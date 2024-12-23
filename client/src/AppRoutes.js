import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Stu_login from './pages/student/Stu_Login';
import MCQExamPage from './pages/student/MCQExamPage';
import Adm_Dashboard from "./pages/admin/Adm_Dashboard";
import Adm_CreateTestForm from "./pages/admin/Adm_CreateTestForm";
import Adm_DraftTest from './pages/admin/Adm_DraftTest';
import Adm_ScheduleTest from './pages/admin/Adm_ScheduleTest';
import Adm_PastTest from './pages/admin/Adm_PastTest';
import Adm_InputQuestions from './pages/admin/Adm_InputQuestions'
import StudentList from './pages/admin/Adm_StudentList';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Stu_login />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/exam/:examId" element={<MCQExamPage />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<Adm_Dashboard />} />
      <Route path="/createtest" element={<Adm_CreateTestForm />} />
      <Route path="/input" element ={<Adm_InputQuestions/>}/>
      <Route path='/admin/StudentList' element={<StudentList/>}/>

      {/* If you want separate pages for each test type */}
      <Route path="/drafted-tests" element={<Adm_DraftTest />} />
      <Route path="/scheduled-tests" element={<Adm_ScheduleTest />} />
      <Route path="/past-tests" element={<Adm_PastTest />} />
    </Routes>
  );
};

export default AppRoutes;
