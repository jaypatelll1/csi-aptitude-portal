import React from 'react';
import { Link } from 'react-router-dom';
import MSidebar from '../components/student/Home/MSidebar'; // Import the MSidebar component

function HomePage() {
  return (
    <div className="home-container" style={{ display: 'flex' }}>
      {/* Sidebar Component */}
      <MSidebar />

      {/* Main Content */}
      <div className="main-content" style={{ flex: 1, padding: '20px' }}>
        <h1>Welcome to the Aptitude Exam Portal</h1>
        <Link to="/exam/1" className="start-exam-btn" >
          Start Exam
        </Link>
      </div>
    </div>
  );
}


export default HomePage;
