import React, { useState, useRef, useEffect } from "react";
import MSidebar from "../../components/student/home/MSidebar";
import StuTestCard from "../../components/student/home/Stu_TestCard";
import StuPastTestCard from "../../components/student/home/Stu_PastTestCard";
import Details from "../../components/student/home/Stu_Details";
import axios from "axios";
import { useLocation } from "react-router-dom";

const pastTests = [
  {
    testName: "General Knowledge",
    submittedOn: "21 Dec 2024",
    marks: 35,
    time: "30 min",
    status: "Passed",
  },
  {
    testName: "Science Quiz",
    submittedOn: "16 Jan 2025",
    marks: 25,
    time: "20 min",
    status: "Failed",
  },
  {
    testName: "Mathematics Quiz",
    submittedOn: "11 Jan 2025",
    marks: 20,
    time: "15 min",
    status: "Passed",
  },
  {
    testName: "General Knowledge",
    submittedOn: "21 Dec 2024",
    marks: 35,
    time: "30 min",
    status: "Passed",
  },
  {
    testName: "Science Quiz",
    submittedOn: "16 Jan 2025",
    marks: 25,
    time: "20 min",
    status: "Failed",
  },
  {
    testName: "Mathematics Quiz",
    submittedOn: "11 Jan 2025",
    marks: 20,
    time: "15 min",
    status: "Passed",
  },
];

function StudentDashboard() {
  const location = useLocation();
  const userData = location.state?.userData;
  // console.log('uers data is',userData );

  const [tests, setTests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const detailsRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for toggling sidebar
    const sidebarRef = useRef(null);

  const fetchTests = async (filterType) => {

    let url = "/api/exams/live"; // Default for "All"

    if (filterType === "upcoming") {
      url = "/api/exams/published";
    } else if (filterType === "past") {
      url = "/api/exams/past";
    }

    try {
      const response = await axios.get(`${url}?page=1&limit=20`);

      setTests(response.data.exams || []);
    } catch (err) {
    } finally {
    }
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


  useEffect(() => {
    fetchTests(filter);
  }, [filter]);

  const openDetails = () => setIsDetailsOpen(true);
  const closeDetails = () => setIsDetailsOpen(false);

  useEffect(() => {
    // Close the Details component when clicking outside
    function handleClickOutside(event) {
      if (detailsRef.current && !detailsRef.current.contains(event.target)) {
        closeDetails();
      }
    }

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Cleanup the listener
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFilterChange = (e) => {
    setFilter(e.target.value); // Update filter
  };

  return (
    <div className={`flex h-screen`}>
  {/* Sidebar */}
  <div
    ref={sidebarRef}
    className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${
      sidebarOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
    } transition-transform duration-300 ease-in-out w-64 xl:block`}
  >
    <MSidebar />
  </div>

  {/* Main Section */}
  <div
    id="main-section"
    className={`flex-grow bg-white h-max overflow-hidden transition-all duration-300 ${
      sidebarOpen ? "ml-64" : "ml-0 xl:ml-64"
    }`}
  >
    {/* Top Bar */}
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
      <h1 className="text-xl font-medium text-gray-800 ml-5">Dashboard</h1>
      <div
        className="h-9 w-9 rounded-full bg-blue-300 ml-auto mr-5 flex items-center justify-center text-blue-700 text-sm hover:cursor-pointer"
        onClick={openDetails}
      >
        AM
      </div>
      <div ref={detailsRef}>
        {isDetailsOpen && (
          <Details
            name={userData.name}
            email={userData.email}
            mobile={userData.phone}
            branch={userData.branch}
          />
        )}
      </div>
    </div>

    {/* Main Content */}
    <div className="px-4">
      <h1 className="text-blue-700 text-2xl mt-4 font-medium">
        Welcome to Atharva college Aptitude Portal
      </h1>

      {/* Filters Section */}
      <div className="flex border-b border-gray-200 pb-3 items-center mt-5">
        <select
          className="bg-white px-3 py-1 focus:outline-none font-medium text-black hover:cursor-pointer"
          value={filter}
          onChange={handleFilterChange}
        >
          <option value="all">All tests</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
        <h1 className="font-semibold text-blue-700 text-xs ml-auto mr-3 hover:cursor-pointer">
          View All
        </h1>
      </div>

      {/* Test Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
        {tests.length > 0 ? (
          tests.map((test, index) => (
            <StuTestCard
              key={test.exam_id || index}
              examId={test.exam_id}
              testName={test.exam_name}
              duration={test.duration}
              lastDate={null}
            />
          ))
        ) : (
          <p>No exams available.</p>
        )}
      </div>

      {/* Analytics Section */}
      <div className="mt-5">
        <h1 className="font-semibold text-black text-lg">Analytics</h1>
        <div
          className="flex overflow-x-auto space-x-4 mt-3"
          style={{ scrollbarWidth: "none" }}
        >
          {pastTests.map((test, index) => (
            <div className="flex-shrink-0">
              <StuPastTestCard
                key={index}
                testName={test.testName}
                submittedOn={test.submittedOn}
                time={test.time}
                marks={test.marks}
                status={test.status}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</div>


  );
}

export default StudentDashboard;
