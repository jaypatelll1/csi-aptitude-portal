import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Stu_Sidebar from "../../components/student/Stu_Sidebar"; // Sidebar component
import Stu_UpcomingTestCard from "../../components/student/Stu_UpcomingTestCard";
import { useSelector } from "react-redux";

const Stu_UpcomingTest = () => {
  const [tests, setTests] = useState([]); // State to store fetched drafted tests
  const [loading, setLoading] = useState(true); // State to track loading status
  const [error, setError] = useState(null); // State to track errors
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for toggling sidebar
  const sidebarRef = useRef(null);

  const userData = useSelector((state) => state.user.user);
  // console.log('uers data is',userData );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Number of items per page

  useEffect(() => {
    // Close the sidebar if clicked outside
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

  const formatToReadableDate = (isoString) => {
    const date = new Date(isoString);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-IN", options);
  };

  // Fetch drafted tests from the API
  useEffect(() => {
    const fetchDraftedTests = async () => {
      try {
        setLoading(true);
        setError(null);
        let url = "api/exams/student";
        let payload = {
          status: "scheduled",
          target_branches: `{${userData.department}}`,
          target_years: `{${userData.year}}`,
        };

        const response = await axios.post(url, payload, {
          withCredentials: true,
        });
        const fetchedTests = response.data.exams.map((exam) => ({
          exam_id: exam.exam_id,
          end_time: exam.end_time,
          Start_time: exam.start_time,
          title: exam.exam_name || "Untitled Exam",
          questions: exam.total_questions || "N/A",
          duration: exam.duration ? `${exam.duration} min` : "N/A",
          date: formatToReadableDate(exam.created_at),
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

  // Pagination logic
  const totalPages = Math.ceil(tests.length / itemsPerPage);
  const paginatedTests = tests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Section */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Stu_Sidebar />
      </div>

      {/* Main Content Section */}
      <div className="flex-1 p-4 sm:p-6">
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
                d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold ml-52 xl:m-0">Upcoming Tests</h1>
        </div>

        <hr className="mb-4" />
        {loading ? (
          <p>Loading drafted tests...</p> // Show loading indicator
        ) : error ? (
          <p className="text-red-500">{error}</p> // Show error message
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
              {paginatedTests.map((test, index) => (
                <Stu_UpcomingTestCard key={index} test={test} />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                className={`p-2 mx-1 border rounded ${
                  currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
                }`}
                disabled={currentPage === 1}
              >
                &lt; {/* Left Arrow */}
              </button>
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
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className={`p-2 mx-1 border rounded ${
                  currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
                }`}
                disabled={currentPage === totalPages}
              >
                &gt; {/* Right Arrow */}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Stu_UpcomingTest;
