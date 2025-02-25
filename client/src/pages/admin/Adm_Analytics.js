import React, { useState, useRef, useEffect } from "react";
import DepartmentRanking from "../../components/analytics/DepartmentRanking";
import Adm_Navbar from "../../components/admin/Adm_Navbar";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import BarChartComponent from "../../components/analytics/BarChartComponent";
import RadarChartComponent from "../../components/analytics/RadarChartComponent";
import DonutChartComponent from "../../components/analytics/DonutChartComponent";
import HorizontalBarChartComponent from "../../components/analytics/HorizontalBarChartComponent";
import MultiLineChartComponent from "../../components/analytics/MultiLineChartComponent";

function Adm_Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const departments = ["CMPN", "INFT", "EXTC", "ECS", "ELEC"];
  const [selectedDepartment, setSelectedDepartment] = useState("CMPN");

  const handleDepartmentChange = (dept) => {
    setSelectedDepartment(dept);
  };

  const departmentPerformanceData = {
    title: "Department Performance Over Time",
    chartData: [
      { date: "2024-01-05", CMPN: 72, EXTC: 58, ECS: 62, ELEC: 49, IT: 80 },
      { date: "2024-01-10", CMPN: 65, EXTC: 63, ECS: 48, ELEC: 60, IT: 77 },
      { date: "2024-01-15", CMPN: 78, EXTC: 70, ECS: 55, ELEC: 65, IT: 85 },
      { date: "2024-01-20", CMPN: 83, EXTC: 66, ECS: 60, ELEC: 55, IT: 78 },
      { date: "2024-01-25", CMPN: 91, EXTC: 75, ECS: 70, ELEC: 67, IT: 95 },
      { date: "2024-01-30", CMPN: 88, EXTC: 80, ECS: 52, ELEC: 74, IT: 90 },
      { date: "2024-02-01", CMPN: 75, EXTC: 82, ECS: 68, ELEC: 58, IT: 88 },
      { date: "2024-02-05", CMPN: 79, EXTC: 78, ECS: 61, ELEC: 72, IT: 84 },
      { date: "2024-02-10", CMPN: 93, EXTC: 85, ECS: 66, ELEC: 79, IT: 98 },
      { date: "2024-02-15", CMPN: 85, EXTC: 70, ECS: 57, ELEC: 68, IT: 90 },
      { date: "2024-02-20", CMPN: 95, EXTC: 81, ECS: 73, ELEC: 64, IT: 91 },
      { date: "2024-02-25", CMPN: 89, EXTC: 79, ECS: 60, ELEC: 69, IT: 85 },
      { date: "2024-03-01", CMPN: 97, EXTC: 88, ECS: 76, ELEC: 82, IT: 99 },
      { date: "2024-03-05", CMPN: 90, EXTC: 76, ECS: 72, ELEC: 70, IT: 94 },
      { date: "2024-03-10", CMPN: 99, EXTC: 89, ECS: 65, ELEC: 75, IT: 100 },
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
      <Adm_Sidebar />
    </div>

    {/* Main Content */}
    <div className="flex-1 w-full bg-gray-100">
      <Adm_Navbar />

      <div className="flex items-center justify-between mt-8">
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
        <h1 className="text-3xl font-bold text-gray-800  xl:ml-7 md ">
          Analytics Dashboard
        </h1>
        <div className="flex justify-center space-x-4 mr-10">
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
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mt-5 mb-5 ml-5 mr-5">
        {/* Department Average Score */}
        <div className="bg-white p-6 rounded-xl shadow-md col-span-2">
          <BarChartComponent data={barChartData} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md col-span-3">
        <MultiLineChartComponent data={departmentPerformanceData} />
        </div>
      </div>

      {/* Rankings & Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5 mt-5 mb-5  ml-5 mr-5 ">
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center">
          <DonutChartComponent data={donutChartData} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <RadarChartComponent data={radarChartData} />
        </div>
      </div>

      {/* Performers Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5 mb-5 ml-5 mr-5">
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
