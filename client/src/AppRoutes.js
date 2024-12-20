import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Stu_login from './pages/student/Stu_Login';
import MCQExamPage from './pages/student/MCQExamPage';
import Adm_Dashboard from "./pages/admin/Adm_Dashboard"

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/Home" element={<HomePage />} />

      
      <Route path="/" element ={<Stu_login/>}/>
      <Route path="/admin" element ={<Adm_Dashboard/>}/>

      <Route path="/exam/:examId" element={<MCQExamPage />} />
    
    </Routes>
  );
};

export default AppRoutes;
