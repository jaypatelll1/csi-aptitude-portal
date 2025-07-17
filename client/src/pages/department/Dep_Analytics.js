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
import Loader from "../../components/Loader";

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
  const [studentCount, setStudentCount] = useState(0);
  const [dSup, setDSup] = useState("");

  // Refs and Redux State
  const sidebarRef = useRef(null);
  const user_department = useSelector((state) => state.user.user.department);
  const departmentAnalysis = useSelector(
    (state) => state.analysis.departmentAnalysis[user_department]
  ); // Fetch data from redux

  // Data Fetching
  const fetchAllDeptData = async () => {
    try {
      setCategoryWiseData(departmentAnalysis.category_performance);
      setTopPerformers(departmentAnalysis.top_performer);
      setBottomPerformers(departmentAnalysis.bottom_performer);
      setParticipationRate(departmentAnalysis.participation_rate);
      setAccuracyData(departmentAnalysis.accuracy_rate);
      setPerformanceOverTime(departmentAnalysis.performance_over_time);

      setDeptRank(departmentAnalysis.dept_ranks);
      superscript(setDSup, departmentAnalysis.dept_ranks?.department_rank);

      setStudentCount(departmentAnalysis.studentCount.student_count);

      setLoading(false); // Set loading to false once all data is fetched
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false); // Ensure loading is disabled even if an error occurs
    }
  };

  // Effects
  useEffect(() => {
    fetchAllDeptData();
  }, [user_department, loading]);

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
    chartData: performanceOverTime?.map((exam) => ({
      name: exam?.created_on,
      Average: exam?.average_score,
    })),
  };

  const radarChartData = {
    title: "Subject-wise Performance",
    chartData: categoryWiseData
      ?.filter((category) => category?.category && category?.category !== "null")
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
    <div className="min-h-screen flex overflow-x-hidden bg-white">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-100 z-50 border-r-2 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Dep_Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full bg-gray-100">
        <Dep_Navbar />

        {/* Show "Loading..." while analytics are being fetched */}
        {loading ? (
          <div className="flex items-center justify-center h-screen">
            <Loader />
          </div>
        ) : (
          <>
            {/* Analytics Dashboard UI (Only show when data is loaded) */}
            <div className="flex items-center justify-between mt-8">
              <button
                className="xl:hidden text-gray-800 ml-5 -mt-40"
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
                    d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
              <h1 className="text-3xl font-bold text-gray-800 xl:ml-7">Branch Analytics</h1>
              <div className="mr-96"></div> {/* Spacer to balance the layout */}
            </div>

            {/* Dashboard Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 ml-5 mr-5">
              <div>
                <div className="bg-white shadow-lg rounded-lg p-10 flex flex-col items-center border border-gray-200">
                  <DisplayComponent
                    title="Department Rank"
                    rank={deptRank?.department_rank || "Loading..."}
                    superscript={dSup}
                  />
                </div>
                <div className="bg-white shadow-lg rounded-lg p-10 flex flex-col items-center mt-4 border border-gray-200">
                  <DisplayComponent title="Total Students" rank={studentCount || 0} />
                </div>
              </div>

              <div className="bg-white shadow-lg rounded-lg p-5 border border-gray-200 flex-grow flex flex-col items-center col-span-2">
                {performanceOverTime.length > 0 ? ( //Ensures data is not empty or null
                  <LineChartComponent
                    data={performanceOverTimeData}
                    xAxisKey="name"
                    lineDataKey="Percentage"
                  />
                ) : (
                  <p className="text-gray-500 text-lg font-semibold">No Data Available</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 mb-6 ml-5 mr-5 w-full">
              <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
                {participationRateData.chartData?.some((item) => item.value > 0) ? ( //Ensures data is not empty or null
                  <PieChartComponent data={participationRateData} />
                ) : (
                  <p className="text-gray-500 text-lg font-semibold">No Data Available</p>
                )}
              </div>
              <div>
                <TableComponent
                  title="Top Performers"
                  data={topPerformers.length > 0 ? topPerformers : []} //Ensures data is not empty or null
                  type="department"
                />
                {topPerformers.length === 0 && (
                  <p className="text-gray-500 text-lg font-semibold text-center">
                    No Data Available
                  </p>
                )}
              </div>
              <div>
                <TableComponent
                  title="Bottom Performers"
                  data={bottomPerformers.length > 0 ? bottomPerformers : []} //Ensures data is not empty or null
                  type="department"
                />
                {bottomPerformers.length === 0 && (
                  <p className="text-gray-500 text-lg font-semibold text-center">
                    No Data Available
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dep_Analytics;