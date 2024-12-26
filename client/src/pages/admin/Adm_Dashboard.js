import React, { useState } from "react"; 
import { useNavigate } from 'react-router-dom';
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import Adm_DashboardTiles from "../../components/admin/Adm_DashboardTiles";
import Adm_DraftedTestCard from "../../components/admin/Adm_DraftedTestCard";
import Adm_ScheduledTestCard from "../../components/admin/Adm_ScheduleTestCard";
import Adm_PastTestCard from "../../components/admin/Adm_PastTestCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const tileData = [
    { label: "Students", value: 1420 },
    { label: "Departments", value: 5 },
    { label: "Teachers", value: 6 },
    { label: "Baap", value: 69 },
  ];

  const tests = [
    {
      title: "Logical reasoning",
      questions: 40,
      duration: "30 min",
      date: "20 Dec 2024",
    },
    {
      title: "Quantitative Aptitude",
      questions: 50,
      duration: "45 min",
      date: "18 Dec 2024",
    },
    {
      title: "Verbal Ability",
      questions: 30,
      duration: "25 min",
      date: "15 Dec 2024",
    },
    {
      title: "Data Interpretation",
      questions: 35,
      duration: "40 min",
      date: "14 Dec 2024",
    },
  ];

  const scheduledTests = [
    {
      title: "Data Interpretation",
      questions: 35,
      duration: "40 min",
      date: "10 Jan 2025",
    },
  ];

  const pastTests = [
    {
      title: "Verbal Ability",
      questions: 30,
      duration: "25 min",
      date: "15 Dec 2024",
    },
  ];

  const [activeTab, setActiveTab] = useState("drafted"); 
  const createTesthandler = () => {
    navigate("/admin/createtest");
  }
  return (
    <div
      className="dashboard-container overflow-x-hidden" // Prevent horizontal scroll
      style={{ display: "flex", height: "100vh" }}
    >
      {/* Sidebar */}
      <div className="w-full sm:w-1/6 bg-gray-100">
        <Adm_Sidebar />
      </div>

      {/* Main content area */}
      <div className="w-full sm:w-5/6 bg-gray-100 flex flex-col items-center relative">
        {/* Top Heading and Create Test Button */}
        <div className="w-full sm:w-[92%] flex justify-between items-center p-4 absolute top-0 sm:right-[4%] sm:left-[4%]">
          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-700 mt-4">Admin Dashboard</h1>

          {/* Create Test Button */}
          <button onClick={createTesthandler} className="bg-blue-600 text-white py-2 px-8 rounded-lg shadow-md hover:bg-blue-700 mt-4">
            + Create Test
          </button>
        </div>

        {/* Dashboard Tiles */}
        <div
          className="p-6 w-full flex justify-center"
          style={{ position: "absolute", top: "100px" }}
        >
          <div className="flex space-x-4 justify-center flex-wrap sm:flex-nowrap">
            {tileData.map((item, index) => (
              <Adm_DashboardTiles key={index} item={item} />
            ))}
          </div>
        </div>

        {/* Unified Tabs and Cards Section */}
        <div className="bg-white shadow-md rounded-lg w-full sm:w-[93%] p-6 mt-[280px]">
          {/* Tabs Section */}
          <div className="flex justify-start space-x-8 border-b pb-4 mb-6">
            <button
              className={`text-lg font-semibold ${
                activeTab === "drafted"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("drafted")}
            >
              Drafted Tests
            </button>
            <button
              className={`text-lg font-semibold ${
                activeTab === "scheduled"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("scheduled")}
            >
              Scheduled Tests
            </button>
            <button
              className={`text-lg font-semibold ${
                activeTab === "past"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("past")}
            >
              Past Tests
            </button>
          </div>

          {/* Cards Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {activeTab === "drafted" &&
              tests.map((test, index) => (
                <Adm_DraftedTestCard key={index} test={test} />
              ))}
            {activeTab === "scheduled" &&
              scheduledTests.map((test, index) => (
                <Adm_ScheduledTestCard key={index} test={test} />
              ))}
            {activeTab === "past" &&
              pastTests.map((test, index) => (
                <Adm_PastTestCard key={index} test={test} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
