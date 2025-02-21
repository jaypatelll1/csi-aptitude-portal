import React, { useState, useRef, useEffect } from "react";
import DepartmentRanking from "../../components/analytics/DepartmentRanking";
import Dep_Navbar from "../../components/department/Dep_Navbar";
import Dep_sidebar from "../../components/department/Dep_Sidebar";
import BarChartComponent from "../../components/analytics/BarChartComponent";
import RadarChartComponent from "../../components/analytics/RadarChartComponent";
import DonutChartComponent from "../../components/analytics/DonutChartComponent";
import HorizontalBarChartComponent from "../../components/analytics/HorizontalBarChartComponent";
import AdmLineChartComponent from "../../components/analytics/AdmLineChartComponent";

function Adm_Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const departments = ["CMPN", "INFT", "EXTC", "ECS", "ELEC"];
  const [selectedDepartment, setSelectedDepartment] = useState("CMPN");

  const handleDepartmentChange = (dept) => {
    setSelectedDepartment(dept);
  };

  const lineChartData = {
    title: "Performance Over Time",
    chartData: [
      { month: "Jan", score: 70 },
      { month: "Feb", score: 75 },
      { month: "Mar", score: 78 },
      { month: "Apr", score: 80 },
      { month: "May", score: 85 },
      { month: "Jun", score: 82 },
      { month: "Jul", score: 88 },
      { month: "Aug", score: 90 },
      { month: "Sep", score: 87 },
      { month: "Oct", score: 92 },
      { month: "Nov", score: 95 },
      { month: "Dec", score: 98 },
    ],
  };

  const barChartData = {
    title: "Department Average Score",
    dataKey: "department",
    chartData: [
      { department: "CMPN", rank: 75 },
      { department: "INFT", rank: 85 },
      { department: "EXTC", rank: 90 },
      { department: "ECS", rank: 65 },
      { department: "ELEC", rank: 50 },
    ],
  };

  const donutChartData = {
    title: "Accuracy Rate",
    chartData: [
      { name: "Correct", value: 65, fill: "#4CAF50" },
      { name: "Wrong", value: 35, fill: "#F44336" },
    ],
  };

  const horizontalBarChartData = {
    title: "Participation Rate",
    yKey: "category",
    xKey: ["value"],
    colors: { value: "#1349C5" },
    chartData: [
      { category: "Total Students", value: 1000 },
      { category: "Participated Students", value: 754 },
      { category: "Not Participated Students", value: 246 },
    ],
  };

  const radarChartData = {
    title: "Subject-wise Performance",
    chartData: [
      { name: "Technical", yourScore: 70, average: 65, maxMarks: 100 },
      { name: "General Aptitude", yourScore: 80, average: 72, maxMarks: 100 },
      { name: "Logical Reasoning", yourScore: 60, average: 68, maxMarks: 100 },
      {
        name: "Quantitative Analysis",
        yourScore: 75,
        average: 70,
        maxMarks: 100,
      },
      { name: "Verbal Analysis", yourScore: 85, average: 78, maxMarks: 100 },
    ],
  };

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

  return (
    <div className="min-h-screen flex overflow-x-hidden bg-white">
    {/* Sidebar */}
    <div
      ref={sidebarRef}
      className={`fixed top-0 left-0 h-full bg-gray-100 z-50 border-r-2 transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
    >
      <Dep_sidebar />
    </div>

    {/* Main Content */}
    <div className="flex-1 w-full bg-gray-100">
      <Dep_Navbar />

      <div className="flex items-center justify-between mt-4">
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
        <h1 className="text-3xl font-bold text-gray-800 ml-60 xl:ml-5">
          Analytics Dashboard
        </h1>
        <div className="flex justify-center  mt-5 space-x-4 mr-10">
        {departments.map((dept) => (
          <button
            key={dept}
            className={`px-6 py-2 rounded-md font-semibold transition-all ${
              selectedDepartment === dept
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-300 text-gray-800"
            }`}
            onClick={() => handleDepartmentChange(dept)}
          >
            {dept}
          </button>
        ))}
      </div>
      </div>

      {/* Department Selection Buttons */}
     

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6 ml-5">
        {/* Department Average Score */}
        <div className="bg-white p-6 rounded-xl shadow-md col-span-2">
          <BarChartComponent data={barChartData} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md col-span-3">
          <AdmLineChartComponent data={lineChartData} />
        </div>
      </div>

      {/* Rankings & Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 mt-6 ml-5">
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center">
          <DonutChartComponent data={donutChartData} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <RadarChartComponent data={radarChartData} />
        </div>
      </div>

      {/* Performers Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 ml-5">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-3">Top Performers</h2>
          <ul>
            {["Jaydeep Joshi", "Rohan Mehta", "Aditi Sharma", "Nikhil Patel", "Sanya Singh"].map(
              (name, index) => (
                <li key={index} className="border-b py-2 text-gray-700">
                  {index + 1}. {name}
                </li>
              )
            )}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-3">Bottom Performers</h2>
          <ul>
            {["Student A", "Student B", "Student C", "Student D", "Student E"].map(
              (name, index) => (
                <li key={index} className="border-b py-2 text-gray-700">
                  {index + 96}. {name}
                </li>
              )
            )}
          </ul>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <HorizontalBarChartComponent data={horizontalBarChartData} />
        </div>
      </div>
    </div>
  </div>
  );
}

export default Adm_Analytics;
