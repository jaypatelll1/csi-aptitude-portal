import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar"; // Import the Sidebar
import Adm_PastTestCard from "../../components/admin/Adm_PastTestCard"; // Import the PastTestCard
import Adm_Navbar from "../../components/admin/Adm_Navbar";

const Adm_PastTest = () => {
  const [pastTests, setPastTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Number of items per page

  useEffect(() => {
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

  useEffect(() => {
    const fetchPastTests = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/exams/past");
        const { exams } = response.data;
        const formattedTests = exams.map((exam) => ({
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

  // Pagination logic
  const totalPages = Math.ceil(pastTests.length / itemsPerPage);
  const paginatedTests = pastTests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

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

      <div className="flex-1 bg-gray-100">
        <Adm_Navbar/>
        <div className="flex items-center h-16 ml-4 border-b border-black mr-3">
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
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold ml-32 xl:ml-0">
            Past Tests
          </h1>
        </div>
        <hr />
        {loading && <p>Loading past tests...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            {/* Grid Layout for Paginated Past Test Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-5 sm:gap-0 mt-8">
              {paginatedTests.map((test, index) => (
                <Adm_PastTestCard key={index} test={test} />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                className={`p-2 mx-1 border rounded ${
                  currentPage === 1
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-200"
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
                    currentPage === i + 1
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className={`p-2 mx-1 border rounded ${
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-200"
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

export default Adm_PastTest;
