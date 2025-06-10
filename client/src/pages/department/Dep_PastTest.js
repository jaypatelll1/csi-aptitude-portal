import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Dep_Sidebar from "../../components/department/Dep_Sidebar";
import Dep_PastTestCard from "../../components/department/Dep_PastTestCard";
import Dep_Navbar from "../../components/department/Dep_Navbar";
import Loader from "../../components/Loader";
import { useSelector } from "react-redux";

const Dep_PastTest = () => {
  const [pastTests, setPastTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const userData = useSelector((state) => state.user.user);
  const branch = userData.department;

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
        let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
        const response = await axios.get(`${API_BASE_URL}/api/exams/past`, {
          params: {
            role: "Department",
            branch: branch,
          },
          withCredentials: true,
        });
        const formattedTests = response.data.exams.map((exam) => ({
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
        
        // ✅ Set the formatted test data into state
        setPastTests(formattedTests);
      } catch (err) {
        console.error("Error fetching past tests:", err);
        setError("Failed to fetch past tests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPastTests();
  }, [branch]);

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
        className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Dep_Sidebar />
      </div>

      <div className="flex-1 bg-gray-100">
        <Dep_Navbar />

        {!loading && (
          <>
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
                    d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>

              <h1 className="text-xl sm:text-2xl font-bold ml-32 xl:ml-0">Past Tests</h1>
            </div>

            <hr />
          </>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-screen">
            <Loader />
          </div>
        ) : error ? (
          <p className="text-red-500 text-center mt-8">{error}</p>
        ) : pastTests.length === 0 ? (
          <p className="text-gray-500 text-center w-full mt-8">No past tests available.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-y-5 mt-8">
              {paginatedTests.map((test, index) => (
                <Dep_PastTestCard key={index} test={test} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`p-2 mx-1 border rounded ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-1 mx-1 border rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : "hover:bg-gray-200"}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`p-2 mx-1 border rounded ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
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

export default Dep_PastTest;
