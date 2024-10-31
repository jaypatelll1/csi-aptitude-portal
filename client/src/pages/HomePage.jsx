import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="home-container">
      <h1>Welcome to the Aptitude Exam Portal</h1>
      <Link to="/exam/1" className="start-exam-btn">
        Start Exam
      </Link>
    </div>
  );
}

export default HomePage;
