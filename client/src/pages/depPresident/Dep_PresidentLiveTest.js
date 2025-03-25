import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Dep_PresidentSidebar from "../../components/depPresident/Dep_PresidentSidebar"; // Sidebar component
import Dep_PresidentLiveTestCard from "../../components/depPresident/Dep_PresidentLiveTestCard"; // Drafted Test Card component
import Dep_PresidentNavbar from "../../components/depPresident/Dep_PresidentNavbar";
import Loader from "../../components/Loader";
import { useSelector } from "react-redux";
// const API_BASE_URL = process.env.BACKEND_BASE_URL;

const Dep_PresidentLiveTest = () => {
  const [tests, setTests] = useState([]); // State to store fetched drafted tests
  const [loading, setLoading] = useState(true); // State to track loading status
  const [error, setError] = useState(null); // State to track errors
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for toggling sidebar
  const sidebarRef = useRef(null);

  const liveExams = useSelector((state) => state?.displayExam.liveExams);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1); // Tracks the current page
  const itemsPerPage = 10; // Number of items to display per page

  const totalPages = Math.ceil(tests.length / itemsPerPage); // Total number of pages

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

  // Fetch drafted tests from the API
  useEffect(() => {
    const fetchLiveTests = async () => {
      try {
        setLoading(true); // Set loading to true before fetching
        setError(null); // Clear any existing errors
  
        const fetchedTests = liveExams.exams.map((exam) => ({
          exam_id: exam.exam_id,
          end_time: exam.end_time,
          Start_time: exam.start_time,
          title: exam.exam_name || "Untitled Exam",
          questions: exam.question_count || "N/A",
          duration: exam.duration ? `${exam.duration} min` : "N/A",
          date: formatToReadableDate(exam.created_at),
          target_years: exam.target_years,
          target_branches: exam.target_branches,
        }));

        setTests(fetchedTests);
      } catch (err) {
        setError("Failed to load drafted tests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLiveTests();
  }, []);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Items to display for the current page
  const currentItems = tests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Section */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Dep_PresidentSidebar />
      </div>

      {/* Main Content Section */}
      <div className="flex-1 bg-gray-100">
        <Dep_PresidentNavbar />

        {/* Hide Header while loading */}
        {!loading && (
          <div className="flex items-center h-16 ml-4 border-b border-black mr-3">
            {/* Sidebar Toggle Button */}
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
                  d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold ml-52 xl:ml-0">Live Tests</h1>
          </div>
        )}

        {/* Loader while fetching data */}
        {loading ? (
          <div className="flex justify-center items-center h-screen">
            <Loader />
          </div>
        ) : error ? (
          <p className="text-red-500 text-center mt-8">{error}</p>
        ) : currentItems.length === 0 ? (
          <p className="text-gray-500 text-center w-full mt-8">No Live tests available.</p>
        ) : (
          <>
            {/* Live Tests Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-y-5 mt-6">
              {currentItems.map((test, index) => (
                <Dep_PresidentLiveTestCard key={index} test={test} />
              ))}
            </div>

            {/* Pagination Controls */}
            {tests.length > 0 && totalPages > 1 && (
              <div className="flex justify-center mt-6">
                {/* Previous Page Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`p-2 mx-1 border rounded ${
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
                  }`}
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>

                {/* Page Number Buttons */}
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-1 mx-1 border rounded ${
                      currentPage === i + 1 ? "bg-blue-500 text-white" : "hover:bg-gray-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                {/* Next Page Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`p-2 mx-1 border rounded ${
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-200"
                  }`}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dep_PresidentLiveTest;
