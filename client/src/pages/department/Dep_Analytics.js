import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

// Component Imports
import Dep_Navbar from "../../components/department/Dep_Navbar";
import Dep_Sidebar from "../../components/department/Dep_Sidebar";
import RadarChartComponent from "../../components/analytics/RadarChartComponent";
import DonutChartComponent from "../../components/analytics/DonutChartComponent";
import PieChartComponent from "../../components/analytics/PieChartComponent";
import TableComponent from "../../components/analytics/TableComponent";
import DisplayComponent from "../../components/analytics/DisplayComponent";
import LineChartComponent from "../../components/analytics/LineChartComponent";

function Dep_Analytics() {
  // State Declarations
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accuracyData, setAccuracyData] = useState([]);
  const [categoryWiseData, setCategoryWiseData] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [bottomPerformers, setBottomPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [participationRate, setParticipationRate] = useState([]);
  const [performanceOverTime, setPerformanceOverTime] = useState([]);
  const [deptRank, setDeptRank] = useState([]);
  const [highestPerformer, setHighestPerformer] = useState([]); // For dispalying overall_rank of top student
  const [dSup, setDSup] = useState("");
  const [oSup, setOSup] = useState("");

  // Refs and Redux State
  const sidebarRef = useRef(null);
  const user_department = useSelector((state) => state.user.user.department);

  // Data Fetching
  const fetchAllDeptData = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      const url = `${API_BASE_URL}/api/department-analysis/all-dept-analysis/${user_department}`;
      const response = await axios.get(url, { withCredentials: true });
  
      setCategoryWiseData(response.data.category_performance);
      setTopPerformers(response.data.top_performer);
      setBottomPerformers(response.data.bottom_performer);
      setParticipationRate(response.data.participation_rate);
      setAccuracyData(response.data.accuracy_rate);
      setPerformanceOverTime(response.data.performance_over_time);
  
      setDeptRank(response.data.dept_ranks);
      superscript(setDSup, response.data.dept_ranks.department_rank);
  
      setHighestPerformer(response.data.top_performer[0]);
      superscript(setOSup, response.data.top_performer[0].overall_rank);
  
      setLoading(false);  // Set loading to false once all data is fetched
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);  // Ensure loading is disabled even if an error occurs
    }
  };
  

  // Effects
  useEffect(() => {
    fetchAllDeptData();
  }, [user_department]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Chart Data Preparation
  const donutChartData = {
    title: "Accuracy Rate",
    chartData: [
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
    ],
  };

  const participationRateData = {
    title: "Participation Rate",
    chartData: [
      {
        name: "Participated",
        value: Number(participationRate?.participation_rate) || 0,
        fill: "#1349C5",
      },
      {
        name: "Not Participated",
        value: 100 - (Number(participationRate?.participation_rate) || 0),
        fill: "#6F91F0",
      },
    ],
  };

  const performanceOverTimeData = {
    title: "Performance Over Time",
    color: "#0703fc",
    chartData: performanceOverTime.map((exam) => ({
      name: exam?.created_on,
      Average: exam?.average_score,
    })),
  };

  const radarChartData = {
    title: "Subject-wise Performance",
    chartData: categoryWiseData
      .filter((category) => category?.category && category?.category !== "null")
      .map((category) => ({
        name: category?.category,
        yourScore: Number(category?.average_category_score) || 0,
        maxMarks: Number(category?.max_category_score) || 0,
      })),
  };

  const superscript = (changeUsestateValue, rank) => {
    const condition = rank % 10;
    if (condition === 1) changeUsestateValue("st");
    else if (condition === 2) changeUsestateValue("nd");
    else if (condition === 3) changeUsestateValue("rd");
    else changeUsestateValue("th");
  };

  // Render
  return (
    <div className="min-h-screen flex bg-gray-100 mb-4 overflow-x-hidden">
      {/* Sidebar (Always Visible) */}
      <div
        ref={sidebarRef}
        className="fixed top-0 left-0 h-full bg-gray-50 text-white z-50 w-64 xl:block shadow-lg"
      >
        <Dep_Sidebar />
      </div>
  
      {/* Main Content */}
      <div className="flex flex-col flex-1 xl:ml-64">
        <Dep_Navbar />
  
        <div className="px-5">
          {/* Show "Loading..." if data is not loaded */}
          {loading ? (
            <div className="flex items-center justify-center h-screen text-2xl font-medium">
            Loading...
          </div>
          ) : (
            <>
              <div className="flex items-center mt-4">
                <h1 className="text-3xl font-bold text-gray-800 ml-4 xl:ml-0">
                  Branch Analytics
                </h1>
              </div>
  
              {/* Dashboard Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div>
                  <div className="bg-white shadow-lg rounded-lg p-10 flex flex-col items-center border border-gray-200">
                    <DisplayComponent
                      title="Overall Department Rank"
                      rank={deptRank.department_rank || "Loading..."}
                      superscript={dSup}
                    />
                  </div>
                  <div className="bg-white shadow-lg rounded-lg p-10 flex flex-col items-center mt-4 border border-gray-200">
                    <DisplayComponent
                      title="Overall Student Rank"
                      rank={highestPerformer.overall_rank || "N/A"}
                      superscript={oSup}
                    />
                  </div>
                </div>
  
                <div className="bg-white shadow-lg rounded-lg p-5 border border-gray-200 flex-grow flex flex-col items-center col-span-2">
                  <LineChartComponent
                    data={performanceOverTimeData}
                    xAxisKey="name"
                    lineDataKey="Percentage"
                  />
                </div>
              </div>
  
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 mb-6 w-full">
                <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
                  <PieChartComponent data={participationRateData} />
                </div>
                <div>
                  <TableComponent
                    title="Top Performers"
                    data={topPerformers}
                    type="department"
                  />
                </div>
                <div>
                  <TableComponent
                    title="Bottom Performers"
                    data={bottomPerformers}
                    type="department"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
  
}

export default Dep_Analytics;
