import React, { useEffect, useState } from "react";
import axios from "axios";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar"; // Sidebar component
import Adm_DraftedTestCard from "../../components/admin/Adm_DraftedTestCard"; // Drafted Test Card component

const Adm_DraftTest = () => {
  const [tests, setTests] = useState([]); // State to store fetched drafted tests
  const [loading, setLoading] = useState(true); // State to track loading status
  const [error, setError] = useState(null); // State to track errors
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for toggling sidebar

  // Fetch drafted tests from the API
  useEffect(() => {
    const fetchDraftedTests = async () => {
      try {
        setLoading(true); // Set loading to true before fetching
        setError(null); // Clear any existing errors

        const response = await axios.get(
          "/api/exams/drafts",
          {
            withCredentials: true, 
          }
        );

        const fetchedTests = response.data.exams.map((exam) => ({
          title: exam.exam_name || "Untitled Exam",
          questions: exam.questions_count || "N/A", // Assuming `questions_count` exists
          duration: exam.duration ? `${exam.duration} min` : "N/A",
          date: exam.start_time
            ? new Date(exam.start_time).toLocaleDateString()
            : "N/A",
        }));

        setTests(fetchedTests);
      } catch (err) {
        setError("Failed to load drafted tests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDraftedTests();
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Section */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Adm_Sidebar />
      </div>

      {/* Main Content Section */}
      <div className="flex-1 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Drafted Tests</h1>

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
        </div>

        <hr className="mb-4" />
        {loading ? (
          <p>Loading drafted tests...</p> // Show loading indicator
        ) : error ? (
          <p className="text-red-500">{error}</p> // Show error message
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-6">
            {/* Map through the test data and pass each test to Adm_DraftedTestCard */}
            {tests.map((test, index) => (
              <Adm_DraftedTestCard key={index} test={test} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Adm_DraftTest;
