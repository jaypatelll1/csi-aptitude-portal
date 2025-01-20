import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import Adm_DashboardTiles from "../../components/admin/Adm_DashboardTiles";
import Adm_DraftedTestCard from "../../components/admin/Adm_DraftedTestCard";
import Adm_ScheduledTestCard from "../../components/admin/Adm_ScheduleTestCard";
import Adm_PastTestCard from "../../components/admin/Adm_PastTestCard";
import Adm_Navbar from "../../components/admin/Adm_Navbar";
import axios from "axios";
import { useSelector } from "react-redux";
// const API_BASE_URL = process.env.BACKEND_BASE_URL;
// const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;

const Dashboard = () => {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.user.user);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [tileData, setTileData] = useState([]);
  const [activeTab, setActiveTab] = useState("drafted");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [testsData, setTestsData] = useState({
    drafted: [],
    scheduled: [],
    past: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const sidebarRef = useRef(null);

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
      const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      const response = await axios.get(endpoint , {
        withCredentials: true,
      });
      console.log(response)
      console.log( "testsData", testsData)
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
          target_years:exam.target_years || 'N/A',
          target_branches:exam.target_branches || 'N/A',
        })),
      }));
    } catch (err) {
      console.error(`Error fetching ${key} tests:`, err);
      setError(`Failed to fetch ${key} tests. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
        const [studentsRes, testsRes, lastTestRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/stats/all-students`, {
            withCredentials: true,  // Make sure the cookie is sent with the request
        }),
          axios.get(`${API_BASE_URL}/api/stats/all-tests`, {
            withCredentials: true,  // Make sure the cookie is sent with the request
        }),
          axios.get(`${API_BASE_URL}/api/stats/last-test`, {
            withCredentials: true,  // Make sure the cookie is sent with the request
        }),
        ]);

        const studentsCount = studentsRes.data.totalStudentsCount;
        const liveTestsCount = testsRes.data.liveTestsCount;
        const scheduledTestsCount = testsRes.data.scheduledTestsCount;
        const lastTestStudentCount = lastTestRes.data.studentCount;

        setTileData([
          { label: "Live Tests", value: liveTestsCount },
          { label: "Scheduled Tests", value: scheduledTestsCount },
          { label: "Active Students", value: studentsCount },
          { label: "Students in Last Exam", value: lastTestStudentCount },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    const fetchAllTestsData = async () => {
      setLoading(true);
      try {
        const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
        await fetchTestsData(`${API_BASE_URL}/api/exams/drafts`, "drafted");
        await fetchTestsData(`${API_BASE_URL}/api/exams/scheduled`, "scheduled");
        await fetchTestsData(`${API_BASE_URL}/api/exams/past`, "past");
      } catch (err) {
        console.error("Error fetching test data:", err);
        setError("Failed to load tests. Please try again.");
      }
    };

    fetchDashboardData();
    fetchAllTestsData();
  }, []);

  const createTestHandler = () => {
    navigate("/admin/createtest");
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
        <Adm_Navbar />

        <div className="flex items-center justify-between mt-5">
          <button
            className="xl:hidden text-gray-800"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
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
                d={
                  sidebarOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
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
            {["drafted", "scheduled", "past"].map((tab) => (
              <button
                key={tab}
                className={`text-lg font-semibold ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {`${tab.charAt(0).toUpperCase()}${tab.slice(1)} Tests`}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              paginatedData?.map((test) => {
                const key = test.exam_id || test.id || test.name;
                console.log(test)

                if (activeTab === "drafted") {
                  return <Adm_DraftedTestCard key={key} test={test} />;
                } else if (activeTab === "scheduled") {
                  return <Adm_ScheduledTestCard key={key} test={test} />;
                } else if (activeTab === "past") {
                  return <Adm_PastTestCard key={key} test={test} />;
                }
                return null;
              })
            )}
          </div>

          <div className="flex justify-center items-center mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className={`p-2 mx-1  rounded ${
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
                className={`px-3 py-1 mx-1  rounded ${
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
              className={`p-2 mx-1  rounded ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-200"
              }`}
              disabled={currentPage === totalPages}
            >
              &gt; {/* Right Arrow */}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;