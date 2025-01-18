import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar"; // Sidebar component
import Adm_LiveTestCard from "../../components/admin/Adm_LiveTestCard"; // Drafted Test Card component
import Adm_Navbar from "../../components/admin/Adm_Navbar";
const API_BASE_URL = process.env.BACKEND_BASE_URL;

const Adm_DraftTest = () => {
  const [tests, setTests] = useState([]); // State to store fetched drafted tests
  const [loading, setLoading] = useState(true); // State to track loading status
  const [error, setError] = useState(null); // State to track errors
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for toggling sidebar
  const sidebarRef = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1); // Tracks the current page
  const itemsPerPage = 9; // Number of items to display per page

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

        const response = await axios.get(`${API_BASE_URL}/api/exams/live`, {
          withCredentials: true,
        },{params:{page:currentPage,limit:itemsPerPage}});
console.log("resdfghj,",response)
        const fetchedTests = response.data.exams.exams.map((exam) => ({
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
  const currentItems = tests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Section */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Adm_Sidebar />
      </div>

      {/* Main Content Section */}
      <div className="flex-1 bg-gray-100">
        <Adm_Navbar/>
        <div className="flex items-center h-16 ml-4 border-b border-black mr-3">
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
          <h1 className="text-xl sm:text-2xl font-bold ml-52 xl:m-0 ">
            Live Tests
          </h1>
        </div>

        <hr className="mb-4" />
        {loading ? (
          <p>Loading live tests...</p> // Show loading indicator
        ) : error ? (
          <p className="text-red-500">{error}</p> // Show error message
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 sm:gap-0  mt-6">
              {/* Display only current items */}
              {currentItems.map((test, index) => (
                <Adm_LiveTestCard key={index} test={test} />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center mt-6">
  {/* Left Arrow Button */}
  <button
    onClick={() => handlePageChange(currentPage - 1)}
    className={`p-2 mx-1 border rounded ${
      currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
    }`}
    disabled={currentPage === 1}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19l-7-7 7-7"
      />
    </svg>
  </button>

  {/* Page Number Buttons */}
  {Array.from({ length: totalPages }, (_, i) => (
    <button
      key={i + 1}
      onClick={() => handlePageChange(i + 1)}
      className={`px-3 py-1 mx-1 text-sm border rounded ${
        currentPage === i + 1
          ? "bg-blue-500 text-white"
          : "hover:bg-gray-200"
      }`}
    >
      {i + 1}
    </button>
  ))}

  {/* Right Arrow Button */}
  <button
    onClick={() => handlePageChange(currentPage + 1)}
    className={`p-2 mx-1 border rounded ${
      currentPage === totalPages
        ? "opacity-50 cursor-not-allowed"
        : "hover:bg-gray-200"
    }`}
    disabled={currentPage === totalPages}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5l7 7-7 7"
      />
    </svg>
  </button>
</div>

          </>
        )}
      </div>
    </div>
  );
};

export default Adm_DraftTest;
