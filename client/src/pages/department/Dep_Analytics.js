import React, { useState, useRef, useEffect } from "react";
import Dep_Navbar from "../../components/department/Dep_Navbar";
import Dep_sidebar from "../../components/department/Dep_Sidebar";
import BarChartComponent from "../../components/analytics/BarChartComponent";
import RadarChartComponent from "../../components/analytics/RadarChartComponent";
import DonutChartComponent from "../../components/analytics/DonutChartComponent";
import axios from "axios";
import PieChartComponent from "../../components/analytics/PieChartComponent";
import TableComponent from "../../components/analytics/TableComponent"; // Added import
import { useSelector } from "react-redux";

function Dep_Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [avgData, setAvgData] = useState([]);
  const [accuracyData, setAccuracyData] = useState([]);
  const [categoryWiseData, setCategoryWiseData] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [bottomPerformers, setBottomPerformers] = useState([]);
  const [participationRate, setParticipationRate] = useState([]);
  const user_department = useSelector((state) => state.user.user.department);

  const fetchAllDeptData = async () => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      let url = `${API_BASE_URL}/api/department-analysis/all-dept-analysis/${user_department}`;
      const response = await axios.get(url, { withCredentials: true });

      setCategoryWiseData(response.data.category_performance);
      setTopPerformers(response.data.top_performer);
      setBottomPerformers(response.data.bottom_performer);
      setParticipationRate(response.data.participation_rate);
      setAccuracyData(response.data.accuracy_rate);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchAllDeptData();
  }, [user_department]);

  const filteredAccuracyData = [
    {
      name: "Correct",
      value: Number(accuracyData?.accuracy_rate) || 0,
      fill: "#4CAF50",
    },
    {
      name: "Wrong",
      value: 100 - (Number(accuracyData?.accuracy_rate) || 0),
      fill: "#F44336",
    },
  ];

  const donutChartData = {
    title: "Accuracy Rate",
    chartData:
      filteredAccuracyData.length > 0
        ? filteredAccuracyData
        : [
            { name: "Correct", value: 0, fill: "#4CAF50" },
            { name: "Wrong", value: 100, fill: "#F44336" },
          ],
  };

  const participationRateData = {
    title: "Participation Rate",
    chartData: [
      {
        name: "Participated",
        value: Number(participationRate[0]?.participation_rate) || 0,
        fill: "#1349C5",
      },
      {
        name: "Not Participated",
        value: 100 - (Number(participationRate[0]?.participation_rate) || 0) || 100,
        fill: "#6F91F0",
      },
    ],
  };

  const radarChartData = {
    title: "Subject-wise Performance",
    chartData: categoryWiseData
      .filter(
        (category) =>
          category?.category != null && category?.category !== "null"
      )
      .map((category) => ({
        name: category?.category,
        yourScore: Number(category?.average_category_score) || 0,
        maxMarks: Number(category?.max_category_score) || 0,
      })),
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

        <div className="flex items-center mt-4">
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
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 ml-5">
          {/* Subject-wise Performance */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <RadarChartComponent data={radarChartData} />
          </div>
        </div>

        {/* Rankings & Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6 ml-5">
          {/* Accuracy Rate */}
          <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center">
            <DonutChartComponent data={donutChartData} />
          </div>

          {/* Participation Rate */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <PieChartComponent data={participationRateData} />
          </div>
        </div>

        {/* Performers Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 ml-5">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold mb-3 text-[#1349C5]">Top Performers</h2>
            <ul>
              {topPerformers.map((name, index) => (
                <li key={index} className="border-b py-2 text-gray-700">
                  {name?.department_rank}. {name?.student_name}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold mb-3 text-[#1349C5]">Bottom Performers</h2>
            <ul>
              {bottomPerformers.map((name, index) => (
                <li key={index} className="border-b py-2 text-gray-700">
                  {name?.department_rank}. {name?.student_name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dep_Analytics;