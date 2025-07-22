import React, { useState, useRef, useEffect } from "react";
import Adm_Navbar from "../../components/admin/Adm_Navbar";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import BarChartComponent from "../../components/analytics/BarChartComponent";
import MultiLineChartComponent from "../../components/analytics/MultiLineChartComponent";
import PieChartComponent from "../../components/analytics/PieChartComponent";
import TableComponent from "../../components/analytics/TableComponent";
import { useSelector } from "react-redux";

import axios from "axios";
import Loader from "../../components/Loader";

function Adm_OverallScore() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const user = useSelector((state) => state.user);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Combined state for all chart data
  const [chartData, setChartData] = useState({
    avgData: [],
    topPerformers: [],
    bottomPerformers: [],
    overallAccuracyRate: { overall_accuracy_rate: 0 },
    performanceOverTime: []
  });



  // Single useEffect to handle data fetching and processing
  useEffect(() => {
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
       
      const url = `${API_BASE_URL}/api/analysis/overallAnalysis/${user.user.year}`; // Use the year from user data or adjust as needed
      const response = await axios.get(url, { withCredentials: true });
      
      // Access the response data directly
      const analysisData = response.data;
      
      console.log("Analysis Data:", analysisData); // Debug log
      
      // Process and set all data at once
      if (analysisData) {
        setChartData({
          avgData: analysisData.dept_avg || [],
          topPerformers: analysisData.top_performers || [],
          bottomPerformers: analysisData.bottom_performers || [],
          overallAccuracyRate: { overall_accuracy_rate: analysisData.overall_accuracy_rate || 0 },
          performanceOverTime: analysisData.performance_over_time || []
        });
      }
      
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  fetchAnalyticsData();
}, [user]);



  // Memoized chart data calculations
  const overallAccuracyRateData = React.useMemo(() => {
    const accuracyRate = Number(chartData.overallAccuracyRate?.overall_accuracy_rate || 0);
    const accuracyPercentage = Math.round(accuracyRate * 100);
    
    return {
      title: "Overall Accuracy Rate",
      chartData: [
        {
          name: "Accurate",
          value: accuracyPercentage,
          fill: "#1349C5",
        },
        {
          name: "Inaccurate",
          value: 100 - accuracyPercentage,
          fill: "#6F91F0",
        },
      ],
    };
  }, [chartData.overallAccuracyRate]);

  const barChartData = React.useMemo(() => ({
    title: "Department Average Score",
    dataKey: "department",
    chartData: chartData.avgData?.map((department) => ({
      department: department?.department_name,
      score: Number(department?.avg_score),
    })) || [],
  }), [chartData.avgData]);

  const departmentPerformanceData = React.useMemo(() => {
    if (!chartData.performanceOverTime || Object.keys(chartData.performanceOverTime).length === 0) {
      return { title: "Performance Over Time", chartData: [] };
    }

    // Get all unique dates from the performance data
    const allDates = [
      ...new Set(
        Object.entries(chartData.performanceOverTime).flatMap(([key, value]) =>
          value.map((entry) => entry.date).filter(Boolean)
        )
      ),
    ];

    const sortedDates = [...allDates].sort((a, b) => new Date(a) - new Date(b));

    const mergedData = sortedDates.map((date) => {
      const dataPoint = { date };
      Object.entries(chartData.performanceOverTime).forEach(([deptKey, entries]) => {
        const deptName = deptKey.toUpperCase();
        const sameDayEntries = entries.filter((entry) => entry.date === date);
        if (sameDayEntries.length > 0) {
          const totalScore = sameDayEntries.reduce((sum, entry) => sum + entry.avg_score, 0);
          const avgScore = totalScore / sameDayEntries.length;
          dataPoint[deptName] = Number(avgScore.toFixed(1));
        } else {
          dataPoint[deptName] = 0;
        }
      });
      return dataPoint;
    });

    return {
      title: "Performance Over Time",
      chartData: mergedData,
    };
  }, [chartData.performanceOverTime]);

  // Handle sidebar click outside
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

  // Retry function for error state
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Re-trigger the useEffect by forcing a re-render
    window.location.reload();
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex overflow-x-hidden bg-white">
        <div
          ref={sidebarRef}
          className={`fixed top-0 left-0 h-full bg-gray-100 z-50 border-r-2 transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
        >
          <Adm_Sidebar />
        </div>

        <div className="flex-1 w-full bg-gray-100">
          <Adm_Navbar />
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <p className="text-red-500 text-lg font-semibold mb-4">{error}</p>
              <button 
                onClick={handleRetry} 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex overflow-x-hidden bg-white">
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-100 z-50 border-r-2 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Adm_Sidebar />
      </div>

      <div className="flex-1 w-full bg-gray-100">
        <Adm_Navbar />

        {!loading && (
          <div className="flex items-center mt-8">
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
                  d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-800 xl:ml-7 ml-60">Overall Analytics</h1>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-screen">
            <Loader />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mt-5 mb-5 ml-5 mr-5">
              <div className="bg-white p-6 rounded-xl shadow-md col-span-2">
                {barChartData.chartData?.length > 0 ? (
                  <BarChartComponent data={barChartData} />
                ) : (
                  <p className="text-gray-500 text-lg font-semibold">No Data Available</p>
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md col-span-3">
                {departmentPerformanceData.chartData?.length > 0 ? (
                  <MultiLineChartComponent data={departmentPerformanceData} />
                ) : (
                  <p className="text-gray-500 text-lg font-semibold">No Data Available</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5 mb-5 ml-5 mr-5">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <TableComponent
                  title="Top Performers"
                  data={chartData.topPerformers}
                  type="overall"
                />
                {chartData.topPerformers.length === 0 && (
                  <p className="text-gray-500 text-lg font-semibold text-center mt-4">No Data Available</p>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <TableComponent
                  title="Bottom Performers"
                  data={chartData.bottomPerformers}
                  type="overall"
                />
                {chartData.bottomPerformers.length === 0 && (
                  <p className="text-gray-500 text-lg font-semibold text-center mt-4">No Data Available</p>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                {overallAccuracyRateData.chartData?.some((item) => item.value > 0) ? (
                  <PieChartComponent data={overallAccuracyRateData} />
                ) : (
                  <p className="text-gray-500 text-lg font-semibold">No Data Available</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Adm_OverallScore;