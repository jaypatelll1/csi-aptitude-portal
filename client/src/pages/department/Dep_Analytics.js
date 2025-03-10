import React, { useState, useRef, useEffect } from "react";
import Dep_Navbar from "../../components/department/Dep_Navbar";
import Dep_sidebar from "../../components/department/Dep_Sidebar";
import BarChartComponent from "../../components/analytics/BarChartComponent";
import RadarChartComponent from "../../components/analytics/RadarChartComponent";
import DonutChartComponent from "../../components/analytics/DonutChartComponent";
import axios from "axios";
import PieChartComponent from "../../components/analytics/PieChartComponent";
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

  const fetchAvgData = async () => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      let url = `${API_BASE_URL}/api/tpo-analysis/dept-avg`;
      const response = await axios.get(url, { withCredentials: true });
      setAvgData(response.data.results);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchAccuracyData = async () => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      let url = `${API_BASE_URL}/api/tpo-analysis/accuracy-per-dept`;
      const response = await axios.get(url, { withCredentials: true });
      setAccuracyData(response.data.results);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchCategoryWiseData = async () => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      let url = `${API_BASE_URL}/api/department-analysis/category-performance/${user_department}`;
      const response = await axios.get(url, { withCredentials: true });
      setCategoryWiseData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchTopPerformersData = async () => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      let url = `${API_BASE_URL}/api/department-analysis/top-performer/${user_department}`;
      const response = await axios.get(url, { withCredentials: true });
      setTopPerformers(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchBottomPerformersData = async () => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      let url = `${API_BASE_URL}/api/department-analysis/bottom-performer/${user_department}`;
      const response = await axios.get(url, { withCredentials: true });
      setBottomPerformers(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchParticipationRateData = async () => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      let url = `${API_BASE_URL}/api/department-analysis/participation-rate/${user_department}`;
      const response = await axios.get(url, { withCredentials: true });
      setParticipationRate(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // console.log(user_department);
  // console.log("avgData", avgData);
  // console.log("accuracyData", accuracyData);
  // console.log("categoryWiseData", categoryWiseData);
  // console.log("topPerformers", topPerformers);
  // console.log("bottomPerformers", bottomPerformers);
  // console.log("participationRate", participationRate);

  useEffect(() => {
    fetchAvgData();
    fetchAccuracyData();
    fetchCategoryWiseData();
    fetchTopPerformersData();
    fetchBottomPerformersData();
    fetchParticipationRateData();
  }, [user_department]);

  const barChartData = {
    title: "Department Average Score",
    dataKey: "department",
    chartData: avgData.map((department) => ({
      department: department?.department_name,
      score: department?.avg_score,
    })),
  };

  const filteredAccuracyData = accuracyData
    .filter((department) => department?.department_name === user_department)
    .flatMap((department) => [
      {
        name: "Correct",
        value: Number(department?.accuracy_rate),
        fill: "#4CAF50",
      },
      {
        name: "Wrong",
        value: 100 - Number(department?.accuracy_rate),
        fill: "#F44336",
      },
    ]);

  // If filteredData is empty, use default values
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
        value: 100 - Number(participationRate[0]?.participation_rate) || 100,
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
        yourScore: Number(category?.average_category_score),
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

        <div className="flex items-center  mt-4">
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
          <h1 className="text-3xl font-bold text-gray-800  ml-60 xl:ml-5">
            Analytics Dashboard
          </h1>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 ml-5">
          {/* Department Average Score */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <BarChartComponent data={barChartData} />
          </div>

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
            <h2 className="text-lg font-semibold mb-3">Top Performers</h2>
            <ul>
              {topPerformers.map((name, index) => (
                <li key={index} className="border-b py-2 text-gray-700">
                  {name?.rank}. {name?.student_name}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold mb-3">Bottom Performers</h2>
            <ul>
              {bottomPerformers.map((name, index) => (
                <li key={index} className="border-b py-2 text-gray-700">
                  {name?.rank}. {name?.student_name}
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
