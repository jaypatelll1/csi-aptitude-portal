import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MCQExamPage from './pages/student/MCQExamPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/exam/:examId" element={<MCQExamPage />} />
    
    </Routes>
  );
};

export default AppRoutes;
