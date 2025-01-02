import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import Adm_DashboardTiles from "../../components/admin/Adm_DashboardTiles";
import Adm_DraftedTestCard from "../../components/admin/Adm_DraftedTestCard";
import Adm_ScheduledTestCard from "../../components/admin/Adm_ScheduleTestCard";
import Adm_PastTestCard from "../../components/admin/Adm_PastTestCard";
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [tileData, setTileData] = useState([]);
  const [activeTab, setActiveTab] = useState("drafted");
  const [testsData, setTestsData] = useState({
    drafted: [],
    scheduled: [],
    past: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTestsData = async (endpoint, key) => {
    try {
      const response = await axios.get(endpoint);
      setTestsData((prevData) => ({
        ...prevData,
        [key]: response.data.exams.map((exam) => ({
          title: exam.exam_name,
          duration: `${exam.duration} min`,
          date: exam.created_at ? new Date(exam.created_at).toLocaleDateString() : "N/A",
        }))
      }));
    } catch (err) {
      console.error(`Error fetching ${key} tests:`, err);
      setError(`Failed to fetch ${key} tests. Please try again later.`);
    }
  };

  useEffect(() => {
    const fetchTileData = async () => {
      try {
        const [studentsRes, testsRes, lastTestRes] = await Promise.all([
          axios.get('/api/stats/all-students'),
          axios.get('/api/stats/all-tests'),
          axios.get('/api/stats/last-test')
        ]);

        const studentsCount = studentsRes.data.totalStudentsCount;
        const liveTestsCount = testsRes.data.liveTestsCount;
        const scheduledTestsCount = testsRes.data.scheduledTestsCount;
        const lastTestStudentCount = lastTestRes.data.studentCount;

        setTileData([
          { label: "Live Tests", value: liveTestsCount },
          { label: "Scheduled Tests", value: scheduledTestsCount },
          { label: "Active Students", value: studentsCount },
          { label: "Students in Last Exam", value: lastTestStudentCount }
        ]);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchTileData();

    // Fetch tests data
    fetchTestsData('/api/exams/drafts', 'drafted');
    fetchTestsData('/api/exams/drafts', 'scheduled');
    fetchTestsData('/api/exams/past', 'past');
  }, []);

  const createTestHandler = () => {
    navigate("/admin/createtest");
  };

  return (
    <div className="dashboard-container overflow-x-hidden" style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div className="w-full sm:w-1/6 bg-gray-100">
        <Adm_Sidebar />
      </div>

      {/* Main content area */}
      <div className="w-full sm:w-5/6 bg-gray-100 flex flex-col items-center relative">
        {/* Top Heading and Create Test Button */}
        <div className="w-full sm:w-[92%] flex justify-between items-center p-4 absolute top-0 sm:right-[4%] sm:left-[4%]">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-700 mt-4">Admin Dashboard</h1>
          <button onClick={createTestHandler} className="bg-blue-600 text-white py-2 px-8 rounded-lg shadow-md hover:bg-blue-700 mt-4">
            + Create Test
          </button>
        </div>

        {/* Dashboard Tiles */}
        <div className="p-6 w-full flex justify-center" style={{ position: "absolute", top: "100px" }}>
          <div className="flex space-x-4 justify-center flex-wrap sm:flex-nowrap">
            <Adm_DashboardTiles tileData={tileData} />
          </div>
        </div>

        {/* Unified Tabs and Cards Section */}
        <div className="bg-white shadow-md rounded-lg w-full sm:w-[93%] p-6 mt-[280px]">
          <div className="flex justify-start space-x-8 border-b pb-4 mb-6">
            <button
              className={`text-lg font-semibold ${
                activeTab === "drafted" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"
              }`}
              onClick={() => setActiveTab("drafted")}
            >
              Drafted Tests
            </button>
            <button
              className={`text-lg font-semibold ${
                activeTab === "scheduled" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"
              }`}
              onClick={() => setActiveTab("scheduled")}
            >
              Scheduled Tests
            </button>
            <button
              className={`text-lg font-semibold ${
                activeTab === "past" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"
              }`}
              onClick={() => setActiveTab("past")}
            >
              Past Tests
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
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
