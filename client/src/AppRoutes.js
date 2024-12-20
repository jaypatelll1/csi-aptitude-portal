import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Stu_login from './pages/Student/Stu_Login';
import MCQExamPage from './pages/Student/MCQExamPage';
import Adm_Dashboard from "./pages/Admin/Adm_Dashboard"

const AppRoutes = () => {
  return (
    <Routes>

      
      <Route path="/" element ={<Stu_login/>}/>
      <Route path="/admin" element ={<Adm_Dashboard/>}/>
      <Route path="/Home" element={<HomePage />} />
      <Route path="/exam/:examId" element={<MCQExamPage />} />
    
    </Routes>
  );
};

export default AppRoutes;
