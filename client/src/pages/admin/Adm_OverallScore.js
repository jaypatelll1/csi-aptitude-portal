import React, { useState, useRef, useEffect } from "react";
import Adm_Navbar from "../../components/admin/Adm_Navbar";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import BarChartComponent from "../../components/analytics/BarChartComponent";


import MultiLineChartComponent from "../../components/analytics/MultiLineChartComponent";
import axios from "axios";
import PieChartComponent from "../../components/analytics/PieChartComponent";
import TableComponent from "../../components/analytics/TableComponent";

function Adm_OverallScore() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  
  const [accuracyData, setAccuracyData] = useState([]);
  const [avgData, setAvgData] = useState([]);
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

   
  const fetchAllTpoAnalysis = async () => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      let url = `${API_BASE_URL}/api/department-analysis/all-dept-analysis/${selectedDepartment}`;
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
    fetchAllTpoAnalysis();
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
  const allDates = [
    ...new Set(
      allPerformances.flatMap((dept) =>
        dept.map((entry) => entry.created_on).filter(Boolean)
      )
    ),
  ];
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
        value: Number(100 - (participationRate[0]?.participation_rate || 0)).toFixed(2) || 100,
        fill: "#6F91F0",
      },
    ],
  };
  const barChartData = {
    title: "Department Average Score",
    dataKey: "department",
    chartData: avgData.map((department) => ({
      department: department?.department_name,
      score: department?.avg_score,
    })),
  };
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
          <h1 className="text-3xl font-bold text-gray-800 xl:ml-7 md">
            Overall Analytics 
          </h1>
          
        </div>

        {/* Rankings & Statistics */}
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

        {/* Performers Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5 mb-5 ml-5 mr-5">
          <TableComponent title="Top Performers" data={topPerformers} />
          <TableComponent title="Bottom Performers" data={bottomPerformers} />
          <div className="bg-white p-6 rounded-xl shadow-md">
            <PieChartComponent data={participationRateData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Adm_OverallScore;