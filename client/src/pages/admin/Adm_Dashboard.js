import React from 'react';
import { Link } from 'react-router-dom';
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";

function Dashboard() {
    return (
      <div className="dashboard-container" style={{ display: 'flex' }}>
        {/* Sidebar Component */}
        <Adm_Sidebar />
        <Adm_DashboardTiles.js/>
  
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
  
  
  export default Dashboard;