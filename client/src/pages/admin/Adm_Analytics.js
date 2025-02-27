import React, { useState, useRef, useEffect } from "react";
import Adm_Navbar from "../../components/admin/Adm_Navbar";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import BarChartComponent from "../../components/analytics/BarChartComponent";
import RadarChartComponent from "../../components/analytics/RadarChartComponent";
import DonutChartComponent from "../../components/analytics/DonutChartComponent";
import MultiLineChartComponent from "../../components/analytics/MultiLineChartComponent";
import axios from "axios";
import PieChartComponent from "../../components/analytics/PieChartComponent";

function Adm_Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const departments = ["CMPN", "INFT", "EXTC", "ECS", "ELEC"];
  const [avgData, setAvgData] = useState([]);
  const [accuracyData, setAccuracyData] = useState([]);
  const [categoryWiseData, setCategoryWiseData] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("CMPN");
  const [topPerformers, setTopPerformers] = useState([]);
  const [bottomPerformers, setBottomPerformers] = useState([]);
  const [participationRate, setParticipationRate] = useState([]);
  const [performance_cmpn, setPerformance_cmpn] = useState([]);
  const [performance_inft, setPerformance_inft] = useState([]);
  const [performance_extc, setPerformance_extc] = useState([]);
  const [performance_ecs, setPerformance_ecs] = useState([]);
  const [performance_elec, setPerformance_elec] = useState([]);

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
      let url = `${API_BASE_URL}/api/department-analysis/category-performance/${selectedDepartment}`;
      const response = await axios.get(url, { withCredentials: true });
      setCategoryWiseData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchTopPerformersData = async () => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      let url = `${API_BASE_URL}/api/department-analysis/top-performer/${selectedDepartment}`;
      const response = await axios.get(url, { withCredentials: true });
      setTopPerformers(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchBottomPerformersData = async () => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      let url = `${API_BASE_URL}/api/department-analysis/bottom-performer/${selectedDepartment}`;
      const response = await axios.get(url, { withCredentials: true });
      setBottomPerformers(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchParticipationRateData = async () => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      let url = `${API_BASE_URL}/api/department-analysis/participation-rate/${selectedDepartment}`;
      const response = await axios.get(url, { withCredentials: true });
      setParticipationRate(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchPerformanceOverTimeData = async () => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      let url1 = `${API_BASE_URL}/api/department-analysis/performance-over-time/CMPN`;
      const response1 = await axios.get(url1, { withCredentials: true });
      setPerformance_cmpn(response1.data);

      let url2 = `${API_BASE_URL}/api/department-analysis/performance-over-time/INFT`;
      const response2 = await axios.get(url2, { withCredentials: true });
      setPerformance_inft(response2.data);

      let url3 = `${API_BASE_URL}/api/department-analysis/performance-over-time/EXTC`;
      const response3 = await axios.get(url3, { withCredentials: true });
      setPerformance_extc(response3.data);

      let url4 = `${API_BASE_URL}/api/department-analysis/performance-over-time/ECS`;
      const response4 = await axios.get(url4, { withCredentials: true });
      setPerformance_ecs(response4.data);

      let url5 = `${API_BASE_URL}/api/department-analysis/performance-over-time/ELEC`;
      const response5 = await axios.get(url5, { withCredentials: true });
      setPerformance_elec(response5.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // console.log(selectedDepartment);
  // console.log("avgData", avgData);
  // console.log("accuracyData", accuracyData);
  // console.log("categoryWiseData", categoryWiseData);
  // console.log("topPerformers", topPerformers);
  // console.log("bottomPerformers", bottomPerformers);
  // console.log("participationRate", participationRate);
  // console.log("performance_cmpn", performance_cmpn);
  // console.log("performance_inft", performance_inft);
  // console.log("performance_extc", performance_extc);
  // console.log("performance_ecs", performance_ecs);
  // console.log("performance_elec", performance_elec);

  useEffect(() => {
    fetchAvgData();
    fetchAccuracyData();
    fetchCategoryWiseData();
    fetchTopPerformersData();
    fetchBottomPerformersData();
    fetchParticipationRateData();
    fetchPerformanceOverTimeData();
  }, [selectedDepartment]);

  const handleDepartmentChange = (dept) => {
    setSelectedDepartment(dept);
  };

  const allPerformances = [
    performance_cmpn,
    performance_inft,
    performance_extc,
    performance_ecs,
    performance_elec,
  ];

  // Extract all unique dates
  const allDates = [
    ...new Set(
      allPerformances.flatMap((dept) =>
        dept.map((entry) => entry.created_on).filter(Boolean)
      )
    ),
  ];

  // Sort dates in ascending order (YYYY-MM-DD format ensures correct sorting)
  allDates.sort((a, b) => new Date(a) - new Date(b));

  // Merge data by date
  const mergedData = allDates.map((date) => ({
    date,
    CMPN:
      performance_cmpn.find((entry) => entry.created_on === date)
        ?.average_score || 0,
    INFT:
      performance_inft.find((entry) => entry.created_on === date)
        ?.average_score || 0,
    ECS:
      performance_ecs.find((entry) => entry.created_on === date)
        ?.average_score || 0,
    EXTC:
      performance_extc.find((entry) => entry.created_on === date)
        ?.average_score || 0,
    ELEC:
      performance_elec.find((entry) => entry.created_on === date)
        ?.average_score || 0,
  }));

  const departmentPerformanceData = {
    title: "Department Performance Over Time",
    chartData: mergedData,
  };

  const barChartData = {
    title: "Department Average Score",
    dataKey: "department",
    chartData: avgData.map((department) => ({
      department: department?.department_name,
      score: department?.avg_score,
    })),
  };

  const filteredAccuracyData = accuracyData
    .filter((department) => department?.department_name === selectedDepartment)
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
          <div className="bg-white p-6 rounded-xl shadow-md">
            <PieChartComponent data={participationRateData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Adm_Analytics;
