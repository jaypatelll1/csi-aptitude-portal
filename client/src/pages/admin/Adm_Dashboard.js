import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import Adm_DashboardTiles from "../../components/admin/Adm_DashboardTiles";
import Adm_DraftedTestCard from "../../components/admin/Adm_DraftedTestCard";
import Adm_ScheduledTestCard from "../../components/admin/Adm_ScheduleTestCard";
import Adm_PastTestCard from "../../components/admin/Adm_PastTestCard";
import Adm_LiveTestCard from "../../components/admin/Adm_LiveTestCard";
import Adm_Navbar from "../../components/admin/Adm_Navbar";
import axios from "axios";

import { useSelector, useDispatch } from "react-redux";
import Loader from "../../components/Loader";

const Adm_Dashboard = () => {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.user);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [tileData, setTileData] = useState([]);
  const [activeTab, setActiveTab] = useState("live");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [testsData, setTestsData] = useState({
    drafted: [],
    scheduled: [],
    past: [],
    live: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({
    drafted: true,
    scheduled: true,
    past: true,
    live: true,
  });
  const [error, setError] = useState(null);
  const sidebarRef = useRef(null);
  const dispatch = useDispatch();

  const [selectedTestId, setSelectedTestId] = useState(null);

  const handleTestClick = (exam_id) => {
    setSelectedTestId(exam_id);
  };

  const formatToReadableDate = (isoString) => {
    const date = new Date(isoString);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-IN", options);
  };

  // Fetch tests data function
  const fetchTestsData = async (endpoint, key) => {
    try {
      const response = await axios.get(endpoint, {
        withCredentials: true,
      });

      setTestsData((prevData) => ({
        ...prevData,
        [key]: response.data.exams.map((exam) => ({
          exam_id: exam.exam_id,
          end_time: exam.end_time,
          Start_time: exam.start_time,
          title: exam.exam_name || "Untitled Exam",
          questions: exam.question_count || "N/A",
          duration: exam.duration ? `${exam.duration} min` : "N/A",
          date: formatToReadableDate(exam.created_at),
          target_years: exam.target_years || "N/A",
          target_branches: exam.target_branches || "N/A",
        })),
      }));
    } catch (err) {
      console.error(`Error fetching ${key} tests:`, err);
      setError(`Failed to fetch ${key} tests. Please try again later.`);
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [key]: false,
      }));
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
        const [studentsRes, testsRes, lastTestRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/stats/all-students/${userData.user.year}?exam_for=Student`, {
            withCredentials: true,
          }),
          axios.get(`${API_BASE_URL}/api/stats/all-tests?exam_for=Student`, {
            withCredentials: true,
          }),
          // axios.get(`${API_BASE_URL}/api/stats/last-test?exam_for=Student`, {
          //   withCredentials: true,
          // }),
        ]);

        const studentsCount = studentsRes.data.totalStudentsCount;
        const liveTestsCount = testsRes.data.liveTestsCount;
        const scheduledTestsCount = testsRes.data.scheduledTestsCount;
        const pastTestsCount = testsRes.data.pastTestsCount;
       

        setTileData([
          { label: "Live Tests", value: liveTestsCount },
          { label: "Scheduled Tests", value: scheduledTestsCount },
          { label: "Active Students", value: studentsCount },
          { label: "Past Tests", value: pastTestsCount },
          
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    const fetchAllTestsData = async () => {
      setLoading(true);
      try {
        const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
        await Promise.all([
          fetchTestsData(`${API_BASE_URL}/api/exams/drafts?role=TPO`, "drafted"),
          fetchTestsData(`${API_BASE_URL}/api/exams/scheduled?role=TPO`, "scheduled"),
          fetchTestsData(`${API_BASE_URL}/api/exams/past?role=TPO`, "past"),
          fetchTestsData(`${API_BASE_URL}/api/exams/live?role=TPO`, "live"),
        ]);
      } catch (err) {
        console.error("Error fetching test data:", err);
        setError("Failed to load tests. Please try again.");
      }
    };

    fetchDashboardData();
    fetchAllTestsData();
  }, [userData]);

  // Update overall loading state based on individual loading states
  useEffect(() => {
    if (!loadingStates[activeTab]) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [loadingStates, activeTab]);

  // Reset loading state when tab changes
  useEffect(() => {
    setLoading(loadingStates[activeTab]);
  }, [activeTab, loadingStates]);

  const createTestHandler = () => {
    navigate("/admin/createtest");
  };

  // MCQ Generator navigation handler
  const handleMCQGeneratorClick = () => {
    navigate("/admin/mcq-generator"); // Update this path to match your route
  };

 
  const openDetails = () => setIsDetailsOpen(true);
  const closeDetails = () => setIsDetailsOpen(false);

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

  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil((testsData[activeTab]?.length || 0) / ITEMS_PER_PAGE);
  const paginatedData = testsData[activeTab]?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
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
        className={`fixed top-0 left-0 h-full bg-gray-100 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Adm_Sidebar testsData={testsData} />
      </div>

      <div className="flex-1 bg-gray-100">
        <Adm_Navbar setSidebarOpen={setSidebarOpen} />

        <div className="flex items-center justify-between mt-5">
          <button className="xl:hidden text-gray-800" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg
              className="w-7 h-8"
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
          <h1 className="text-2xl font-bold text-gray-700 ml-5">Admin Dashboard</h1>

          <button
            onClick={createTestHandler}
            className="bg-[#1349C5] text-white px-4 py-2 rounded hover:bg-blue-300 hover:text-black border border-blue-700 opacity-90 hover:opacity-100 mr-4"
          >
            + Create Test
          </button>
        </div>

        <div className="p-0 w-full flex justify-center">
          <Adm_DashboardTiles tileData={tileData} />
        </div>

        <div className="p-4 w-[97%] xl:w-[98%] mt-8 ml-4 rounded-xl bg-white">
          <div className="flex space-x-4 border-b pb-2">
            {["live", "drafted", "scheduled", "past"].map((tab) => (
              <button
                key={tab}
                className={`text-lg font-semibold ${
                  activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"
                }`}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
              >
                {`${tab.charAt(0).toUpperCase()}${tab.slice(1)} Tests`}
              </button>
            ))}
          </div>

          <div className="relative min-h-[150px] grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {loading ? (
              <div className="absolute inset-0 flex justify-center items-center col-span-full">
                <Loader />
              </div>
            ) : error ? (
              <p className="col-span-full text-center">{error}</p>
            ) : paginatedData && paginatedData.length > 0 ? (
              paginatedData.map((test) => {
                const key = test.exam_id || test.id || test.name;

                if (activeTab === "live") {
                  return <Adm_LiveTestCard key={key} test={test} />;
                } else if (activeTab === "scheduled") {
                  return <Adm_ScheduledTestCard key={key} test={test} />;
                } else if (activeTab === "past") {
                  return <Adm_PastTestCard key={key} test={test} />;
                } else if (activeTab === "drafted") {
                  return <Adm_DraftedTestCard key={key} test={test} />;
                }
                return null;
              })
            ) : (
              <p className="col-span-full text-gray-500 text-center">No tests available.</p>
            )}
          </div>

          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                className={`p-2 mx-1 rounded ${
                  currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
                }`}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 mx-1 rounded ${
                    currentPage === i + 1 ? "bg-blue-500 text-white" : "hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className={`p-2 mx-1 rounded ${
                  currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
                }`}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          )}
        </div>

        {/* Floating MCQ Generator Button */}
        <button
          onClick={handleMCQGeneratorClick}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-50 group"
          title="MCQ Generator"
        >
          {/* Chat/Message Circle Icon */}
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth={2} 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
            />
          </svg>
          
          {/* Tooltip */}
          <div className="absolute bottom-16 right-0 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            MCQ Generator
          </div>
        </button>
      </div>
    </div>
  );
};

export default Adm_Dashboard;