import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Msidebar from "../../components/student/home/MSidebar";
import { useLocation } from "react-router-dom";

const TestInstruction = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for toggling sidebar
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const location = useLocation();
  const examId = location.state?.examId;
  const Duration = location.state?.Duration;
  console.log("examId", examId);
  console.log("duration", Duration);

  const handleStartTest = () => {
    navigate(`/exam/${examId}`, { state: { Duration: Duration } });
  };
  useEffect(() => {
    // Close the sidebar if clicked outside
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    // Attach event listener to the document
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Section */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64 lg:static lg:translate-x-0`}
      >
        <Msidebar />
      </div>
      <div className="h-screen  bg-gray-50 p-4 rounded-lg flex flex-col justify-between flex-grow">
        <div>
          <div className="flex items-center  mb-4 sm:mb-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-800 focus:outline-none"
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
            <h2 className="text-xl font-bold text-gray-800 sm:ml-40 ml-52 lg:ml-0">
              Online Aptitude Test:{" "}
              <span className="text-blue-600">General Knowledge</span>
            </h2>
          </div>
          <div className="p-4 rounded-lg shadow-sm mt-4">
            <h3 className="text-lg font-semibold text-blue-600 mb-3">
              Instructions:
            </h3>
            <hr className="w-full h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>
                <span className="font-semibold">
                  Total number of questions:
                </span>{" "}
                40 MCQ’s.
              </li>
              <li>
                <span className="font-semibold">Time allotted:</span> {Duration}{" "}
                minutes
              </li>
              <li>
                Each question carries 1 mark; there are no negative marks.
              </li>
              <li>Do not refresh the page.</li>
              <li>All the best!</li>
            </ul>
          </div>
        </div>
        <div className="flex justify-center mb-20">
          <button
            onClick={handleStartTest}
            className="bg-blue-500 text-white mb-8 px-20 py-3 rounded-lg text-md font-medium shadow-md hover:bg-blue-600"
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestInstruction;
