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

  const fetchTests = async (filterType) => {

    let url = "/api/exams/live"; // Default for "All"

    if (filterType === "upcoming") {
      url = "/api/exams/published";
    } else if (filterType === "past") {
      url = "/api/exams/past";
    }

    try {
      const response = await axios.get(url);

      setTests(response.data.exams || []);
    } catch (err) {
    } finally {
    }
  };

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
    <div className="flex h-screen">
      <MSidebar />
      <div
        id="main-section"
        className="ml-64 flex-grow bg-white h-max overflow-hidden"
      >
        <div className="bg-gray-100 h-14 border-b border-gray-200 flex items-center">
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
        <h1 className="text-blue-700 text-2xl ml-10 mt-10 font-medium">
          Welcome to Atharva college Aptitude Portal
        </h1>
        <div className="flex border-b border-gray-200 mx-10 mt-5 pb-3 items-center">
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
            view all
          </h1>
        </div>
        <div className="grid-cols-3 gap-5 grid  mx-10 mt-5 px-5">
          {tests.length > 0 ? (
            tests.map((test, index) => (
              <StuTestCard
                key={test.exam_id || index} // Using exam.id if available, otherwise index
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
        <div className="flex border-b border-gray-200 mx-10 mt-5 pb-3 items-center">
          <h1 className="font-semibold text-black text-lg ml-3 mt-5">
            Analytics
          </h1>
        </div>

        <div
          className=" mx-10 mt-5 flex overflow-x-auto space-x-4 pb-3"
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
  );
}

export default StudentDashboard;
