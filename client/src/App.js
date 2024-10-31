// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MCQExamPage from './pages/student/MCQExamPage';
import './styles/Globals.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/exam/:examId" element={<MCQExamPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
