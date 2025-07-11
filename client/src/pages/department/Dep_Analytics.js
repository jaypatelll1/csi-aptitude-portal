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

const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;

function Dep_Analytics() {
  // State Declarations
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accuracyData, setAccuracyData] = useState({});
  const [categoryWiseData, setCategoryWiseData] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [bottomPerformers, setBottomPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [performanceOverTime, setPerformanceOverTime] = useState([]);
  const [deptRank, setDeptRank] = useState({});
  const [studentCount, setStudentCount] = useState(0);
  const [dSup, setDSup] = useState("");

  // Refs and Redux State
  const sidebarRef = useRef(null);
  const user_department = useSelector((state) => state.user.user.department);

  // Data Fetching
  const fetchAllDeptData = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_BASE_URL}/api/analysis/department/${user_department}`,
        {
          withCredentials: true,
        },
      );

      const data = response.data;
      const departmentData = data.department_analysis[0]; // Get the first department data
      console.log("Department Data:", departmentData);
      console.log("API Response Data:", data);

      if (departmentData) {
        // Set accuracy data
        setAccuracyData({
          accuracy_rate: departmentData.accuracy_rate * 100, // Convert to percentage
        });

        // Set category-wise data from subject_performance
        const categoryData = Object.entries(
          departmentData.subject_performance,
        ).map(([category, performance]) => ({
          category: category,
          average_category_score: performance.score,
          max_category_score: performance.max_score,
        }));
        setCategoryWiseData(categoryData);

        // Set performance over time data
        const performanceData = departmentData.performance_over_time.map(
          (exam) => ({
            created_on: exam.date || `Exam ${exam.exam_id}`,
            average_score: ((exam.avg_score / exam.max_score) * 100).toFixed(2), // Convert to percentage
          }),
        );
        setPerformanceOverTime(performanceData);

        // Set department rank
        setDeptRank({
          department_rank: departmentData.department_rank,
        });
        superscript(setDSup, departmentData.department_rank);

        // Set student count
        setStudentCount(departmentData.student_count);
      }

      // Set top performers
      setTopPerformers(data.top_scorers || []);

      // Set bottom performers (using weak_scorers from the API)
      setBottomPerformers(data.weak_scorers || []);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (user_department) {
      fetchAllDeptData();
    }
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

  // Accuracy Rate Data for Pie Chart
  const accuracyRateData = {
    title: "Accuracy Rate",
    chartData: [
      {
        name: "Accurate",
        value: Math.round(accuracyData?.accuracy_rate) || 0,
        fill: "#1349C5",
      },
      {
        name: "Inaccurate",
        value: 100 - (Math.round(accuracyData?.accuracy_rate) || 0),
        fill: "#6F91F0",
      },
    ],
  };

  const performanceOverTimeData = {
    title: "Performance Over Time",
    color: "#0703fc",
    chartData: performanceOverTime?.map((exam) => ({
      name: exam?.created_on,
      Average: Number(exam?.average_score),
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
                    d={
                      sidebarOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                  />
                </svg>
              </button>
              <h1 className="text-3xl font-bold text-gray-800 xl:ml-7">
                Branch Analytics
              </h1>
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
                  <DisplayComponent
                    title="Total Students"
                    rank={studentCount || 0}
                  />
                </div>
              </div>

              <div className="bg-white shadow-lg rounded-lg p-5 border border-gray-200 flex-grow flex flex-col items-center col-span-2">
                {performanceOverTime.length > 0 ? (
                  <LineChartComponent
                    data={performanceOverTimeData}
                    xAxisKey="name"
                    lineDataKey="Average"
                  />
                ) : (
                  <p className="text-gray-500 text-lg font-semibold">
                    No Data Available
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 mb-6 ml-5 mr-5 w-full">
              <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
                {accuracyRateData.chartData?.some((item) => item.value > 0) ? (
                  <PieChartComponent data={accuracyRateData} />
                ) : (
                  <p className="text-gray-500 text-lg font-semibold">
                    No Data Available
                  </p>
                )}
              </div>
              <div>
                <TableComponent
                  title="Top Performers"
                  data={topPerformers.length > 0 ? topPerformers : []}
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
                  data={bottomPerformers.length > 0 ? bottomPerformers : []}
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
