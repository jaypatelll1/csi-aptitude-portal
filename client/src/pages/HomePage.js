import React from 'react';
import { Link } from 'react-router-dom';
import MSidebar from '../components/Student/Home/MSidebar'; 

function HomePage() {
  return (
    <div className="home-container" style={{ display: 'flex' }}>
      {/* Sidebar Component */}
      <MSidebar />

       
    </div>
  );
}


export default HomePage;
