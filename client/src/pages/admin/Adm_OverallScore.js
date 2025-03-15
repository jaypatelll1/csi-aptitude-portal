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

  const [loading, setLoading] = useState(true); // Step 1: Add Loading State
  const [avgData, setAvgData] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [bottomPerformers, setBottomPerformers] = useState([]);
  const [participationRate, setParticipationRate] = useState([]);
  const [performanceOverTime, setPerformanceOverTime] = useState({});

  const fetchAllTpoAnalysis = async () => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      let url = `${API_BASE_URL}/api/tpo-analysis/all-tpo-analysis`;
      const response = await axios.get(url, { withCredentials: true });
      console.log(response.data);

      setAvgData(response.data.dept_avg);
      setTopPerformers(response.data.top_performers);
      setBottomPerformers(response.data.bottom_performers);
      setParticipationRate(response.data.participation_rate);
      setPerformanceOverTime(response.data.performance_over_time);

      setLoading(false); // Step 2: Set Loading to False after fetching data
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false); // Ensure loading stops even if there's an error
    }
  };

  useEffect(() => {
    fetchAllTpoAnalysis();
  }, []);

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
        value:
          +Number(100 - (participationRate?.participation_rate || 0)).toFixed(
            2
          ) || 100,
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

  // First, get all unique dates
  const allDates = [
    ...new Set(
      Object.entries(performanceOverTime).flatMap(([key, value]) =>
        value.map((entry) => entry.created_on).filter(Boolean)
      )
    ),
  ];

  // Sort dates in chronological order
  const sortedDates = [...allDates].sort((a, b) => new Date(a) - new Date(b));

  // Use all dates
  const selectedDates = sortedDates;

  // Now use these dates to create merged data with averaged scores for same-day exams
  const mergedData = selectedDates.map((date) => {
    const dataPoint = { date };

    // Loop through departments in performanceOverTime and add scores
    Object.entries(performanceOverTime).forEach(([deptKey, entries]) => {
      // Extract department name (remove "dept*" prefix)
      const deptName = deptKey.replace("dept_", "").toUpperCase();

      // Find all entries for current date
      const sameDayEntries = entries.filter(
        (entry) => entry.created_on === date
      );

      if (sameDayEntries.length > 0) {
        // Calculate average score for same-day exams
        const totalScore = sameDayEntries.reduce(
          (sum, entry) => sum + entry.average_score,
          0
        );
        const avgScore = totalScore / sameDayEntries.length;
        dataPoint[deptName] = Number(avgScore.toFixed(1)); // Round to 1 decimal place
      } else {
        dataPoint[deptName] = 0;
      }
    });

    return dataPoint;
  });

  const departmentPerformanceData = {
    title: "Performance Over Time",
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
                d={
                  sidebarOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-800 xl:ml-7 ml-60">
            Overall Analytics
          </h1>
        </div>

        {/* Show Loading Until Data is Ready */}
        {loading ? (
          <div className="flex items-center justify-center h-96 text-2xl font-medium">
          Loading...
        </div>
        ) : (
          <>
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
              <TableComponent
                title="Top Performers"
                data={topPerformers}
                type="overall"
              />
              <TableComponent
                title="Bottom Performers"
                data={bottomPerformers}
                type="overall"
              />
              <div className="bg-white p-6 rounded-xl shadow-md">
                <PieChartComponent data={participationRateData} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Adm_OverallScore;
