import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import Adm_ScheduledTestCard from "../../components/admin/Adm_ScheduleTestCard";

const Adm_ScheduledTest = () => {
  const [scheduledTests, setScheduledTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

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
    const fetchScheduledTests = async () => {
      try {
        setLoading(true); // Set loading to true before fetching
        setError(null); // Clear any existing errors

        const response = await axios.get(
          "/api/exams/draftes", // Replace with your API endpoint
          {
            withCredentials: true,
          }
        );

        const fetchedTests = response.data.exams.map((exam) => ({
          title: exam.exam_name || "Untitled Exam",
          date: exam.start_time
            ? new Date(exam.start_time).toLocaleDateString()
            : "N/A",
          questions: exam.questions_count || "N/A", // Assuming `questions_count` exists
          duration: exam.duration ? `${exam.duration} min` : "N/A",
        }));

        setScheduledTests(fetchedTests);
      } catch (err) {
        setError("Failed to load scheduled tests. Please try again later.");
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchScheduledTests();
  }, []);

  return (
    <div className="min-h-screen flex">
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Adm_Sidebar />
      </div>

      {/* Main Content Section */}
      <div className="flex-1 p-6 ">
        <div className="flex items-center  mb-4 sm:mb-6">
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
          <h1 className="text-xl sm:text-2xl font-bold ml-52 xl:ml-0">
            Scheduled Tasks
          </h1>
        </div>
        <hr />
        {loading ? (
          <p>Loading scheduled tests...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {scheduledTests.map((test, index) => (
              <Adm_ScheduledTestCard key={index} test={test} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Adm_ScheduledTest;
