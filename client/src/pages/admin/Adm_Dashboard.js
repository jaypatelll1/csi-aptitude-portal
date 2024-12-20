import React from 'react';
import { Link } from 'react-router-dom';
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import Adm_DashboardTiles from '../../components/admin/Adm_DashboardTiles';
import { FaUserGraduate, FaBuilding, FaChalkboardTeacher } from 'react-icons/fa';

function Dashboard() {

  const data = [
    { title: 'Students', count: 1420, color: '#4F83F1', icon: <FaUserGraduate /> },
    { title: 'Departments', count: 5, color: '#9B6EF3', icon: <FaBuilding /> },
    { title: 'Teachers', count: 6, color: '#F3A86E', icon: <FaChalkboardTeacher /> },
  ];

  return (
    <div className="dashboard-container" style={{ display: 'flex' }}>
      {/* Sidebar Component */}
      {/* <Adm_DashboardTiles /> */}
      <Adm_Sidebar />

      {/* Main Content */}
      <div className="main-content" style={{ flex: 1, padding: '20px' }}>
        <h1>Welcome to the Aptitude Exam Portal</h1>
        <Link to="/exam/1" className="start-exam-btn" >
          Start Exam
        </Link>
      </div>
      {/* <div style={{ display: 'flex', gap: '20px' }}>
        {data.map((item, index) => (
          <Adm_DashboardTiles
            key={index}
            title={item.title}
            count={item.count}
            color={item.color}
            icon={item.icon}
          />
        ))}
      </div> */}
    </div>
  );
}


export default Dashboard;