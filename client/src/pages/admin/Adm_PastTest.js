// Adm_PastTest.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar"; // Import the Sidebar
import Adm_PastTestCard from "../../components/admin/Adm_PastTestCard"; // Import the PastTestCard

const Adm_PastTest = () => {
  const [pastTests, setPastTests] = useState([]);
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

  const formatToReadableDate = (isoString) => {
    const date = new Date(isoString);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-IN", options);
  };


  useEffect(() => {
    const fetchPastTests = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/exams/past"); // Replace with your actual API endpoint
        const { exams } = response.data;
        const formattedTests = exams.map((exam) => ({
          exam_id : exam.exam_id,
          end_time : exam.end_time,
          Start_time : exam.start_time,
          title: exam.exam_name || "Untitled Exam",
          questions: exam.question_count || "N/A", // Assuming `questions_count` exists
          duration: exam.duration ? `${exam.duration} min` : "N/A",
          date: formatToReadableDate(exam.created_at),
        }));
        setPastTests(formattedTests);
      } catch (err) {
        console.error("Error fetching past tests:", err);
        setError("Failed to fetch past tests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPastTests();
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

      {/* Main Content */}
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
            Past Tests
          </h1>
        </div>
        <hr />
        {loading && <p>Loading past tests...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {/* Grid Layout for Past Test Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
            {pastTests.map((test, index) => (
              <Adm_PastTestCard key={index} test={test} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Adm_PastTest;
