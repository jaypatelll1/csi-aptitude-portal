import React, { useState, useRef, useEffect } from "react";
import Sup_Sidebar from "../../components/super-admin/Sup_Sidebar";
import Sup_Navbar from "../../components/super-admin/Sup_Navbar";
import Sup_DashboardTiles from "../../components/super-admin/Sup_DashboardTiles";
import Sup_LiveTestCard from "../../components/super-admin/Sup_LiveTestCard";

const Sup_Dashboard = () => {
  const sidebarRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dummy data for dashboard tiles
  const dashboardTileData = [
    {
      label: "Students",
      value: "1420"
    },
    {
      label: "Teachers", 
      value: "8"
    },
    {
      label: "Branches",
      value: "4"
    }
  ];

  // Dummy data for live test
  const liveTestData = {
    title: "Logical reasoning",
    questions: "40",
    duration: "30 min",
    branch: "Computer Engineering",
    year: "S.E.",
    status: "Ongoing",
    createdDate: "20 Dec 2024"
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-100 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Sup_Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100">
        
        {/* Navbar */}
        <Sup_Navbar setSidebarOpen={setSidebarOpen} />
        <div className="flex items-center justify-between -mt-10 px-5 xl:hidden">
            <button
              className="text-gray-800"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg
                className="w-7 h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={
                    sidebarOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>

        {/* Dashboard Content */}
        <div className="p-6">
            
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Aptitude</h1>
                <p className="text-lg text-gray-600">You are an Admin !</p>
              </div>
            </div>
          </div>

          {/* Dashboard Tiles */}
          <Sup_DashboardTiles tileData={dashboardTileData} />

          {/* Live Test Section */}
          <Sup_LiveTestCard testData={liveTestData} />

          {/* Mobile Menu Button */}
          
        </div>
      </div>
    </div>
  );
};

export default Sup_Dashboard;