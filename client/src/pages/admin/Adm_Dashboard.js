import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import Adm_DashboardTiles from "../../components/admin/Adm_DashboardTiles";
import Adm_DraftedTestCard from "../../components/admin/Adm_DraftedTestCard";
import Adm_ScheduledTestCard from "../../components/admin/Adm_ScheduleTestCard";
import Adm_PastTestCard from "../../components/admin/Adm_PastTestCard";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
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

  // Fetch tests data function
  const fetchTestsData = async (endpoint, key) => {
    try {
      const response = await axios.get(endpoint);
      setTestsData((prevData) => ({
        ...prevData,
        [key]: response.data.exams.map((exam) => ({
          exam_id: exam.exam_id,
          title: exam.exam_name,
          questions: exam.questions_count || 0,
          duration: `${exam.duration}`,
          date: exam.created_at
            ? new Date(exam.created_at).toLocaleDateString()
            : "N/A",
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
    const fetchDashboardData = async () => {
      try {
        const [studentsRes, testsRes, lastTestRes] = await Promise.all([
          axios.get("/api/stats/all-students"),
          axios.get("/api/stats/all-tests"),
          axios.get("/api/stats/last-test"),
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
        await fetchTestsData("/api/exams/drafts", "drafted");
        await fetchTestsData("/api/exams/scheduled", "scheduled");
        await fetchTestsData("/api/exams/past", "past");
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

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Adm_Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            className="xl:hidden text-gray-800"
            onClick={() => setSidebarOpen(!sidebarOpen)}
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
          <h1 className="text-2xl font-bold text-gray-700">Admin Dashboard</h1>

          <button
            onClick={createTestHandler}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg shadow hover:bg-blue-700"
          >
            + Create Test
          </button>
        </div>

        {/* Dashboard Tiles */}
        <div className="p-0 w-full flex justify-center">
          <Adm_DashboardTiles tileData={tileData} />
        </div>

        {/* Tabs and Cards */}
        <div className="p-4">
          {/* Tabs */}
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

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              testsData[activeTab]?.map((test, index) => {
                if (activeTab === "drafted") {
                  return <Adm_DraftedTestCard key={index} test={test} />;
                } else if (activeTab === "scheduled") {
                  return <Adm_ScheduledTestCard key={index} test={test} />;
                } else if (activeTab === "past") {
                  return <Adm_PastTestCard key={index} test={test} />;
                }
                return null;
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
