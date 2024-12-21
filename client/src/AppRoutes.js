import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Stu_login from './pages/Student/Stu_Login';
import MCQExamPage from './pages/Student/MCQExamPage';
import Adm_Dashboard from "./pages/Admin/Adm_Dashboard"
import Adm_CreateTestForm from "./pages/Admin/Adm_CreateTestForm"
const AppRoutes = () => {
  return (
    <Routes>

      
      <Route path="/" element ={<Stu_login/>}/>
      <Route path="/admin" element ={<Adm_Dashboard/>}/>
      <Route path="/home" element={<HomePage />} />
      <Route path="/exam/:examId" element={<MCQExamPage />} />
    <Route path="/createtest" element={<Adm_CreateTestForm />} />
    </Routes>
  );
};

export default AppRoutes;
