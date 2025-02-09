import React, { useState, useRef, useEffect } from "react";
import Stu_Sidebar from "../../components/admin/Adm_Sidebar";
import Details from "../../components/student/home/Stu_Details";

function Stu_Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for toggling sidebar
  const sidebarRef = useRef(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const detailsRef = useRef(null);


  const openDetails = () => setIsDetailsOpen(true);
  const closeDetails = () => setIsDetailsOpen(false);
  return (
    <div>
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
        } transition-transform duration-300 w-64 xl:block`}
      >
        <Stu_Sidebar />
      </div>
      <div className="bg-gray-100 h-14 border-b border-gray-200 flex items-center">
          {/* Burger Icon Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="xl:hidden text-gray-800 focus:outline-none"
          >
            <svg
              className="w-8 h-8"
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
                    ? "M6 18L18 6M6 6l12 12" // Cross icon for "close"
                    : "M4 6h16M4 12h16M4 18h16" // Burger icon for "open"
                }
              />
            </svg>
          </button>
          <h1 className="text-xl font-medium text-gray-800 ml-5 sm:ml-60 xl:ml-5">
            Dashboard
          </h1>
          <div
            className="h-9 w-9 rounded-full bg-blue-300 ml-auto mr-5 flex items-center justify-center text-blue-700 text-sm hover:cursor-pointer"
            onClick={openDetails}
          >
            AM
          </div>
          <div ref={detailsRef}>{isDetailsOpen && <Details />}</div>
        </div>
    </div>
  );
}

export default Stu_Analytics;
