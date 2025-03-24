import React, { useState, useRef, useEffect } from "react";
import Adm_Navbar from "../../components/admin/Adm_Navbar";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import BarChartComponent from "../../components/analytics/BarChartComponent";
import MultiLineChartComponent from "../../components/analytics/MultiLineChartComponent";
import PieChartComponent from "../../components/analytics/PieChartComponent";
import TableComponent from "../../components/analytics/TableComponent";
import { useSelector } from "react-redux";

import Loader from "../../components/Loader";

function Adm_OverallScore() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [avgData, setAvgData] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [bottomPerformers, setBottomPerformers] = useState([]);
  const [participationRate, setParticipationRate] = useState([]);
  const [performanceOverTime, setPerformanceOverTime] = useState([]);

  const overallAnalysis = useSelector((state) => state.analysis.overallAnalysis); // Fetch data from redux

  const fetchAllTpoAnalysis = () => {
    try {
      if (overallAnalysis) {
        setAvgData(overallAnalysis.dept_avg || []);
        setTopPerformers(overallAnalysis.top_performers || []);
        setBottomPerformers(overallAnalysis.bottom_performers || []);
        setParticipationRate(overallAnalysis.participation_rate || { participation_rate: 0 });
        setPerformanceOverTime(overallAnalysis.performance_over_time || []);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTpoAnalysis();
  }, [loading]);

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
        value: +Number(100 - (participationRate?.participation_rate || 0)).toFixed(2) || 100,
        fill: "#6F91F0",
      },
    ],
  };

  const barChartData = {
    title: "Department Average Score",
    dataKey: "department",
    chartData: avgData?.map((department) => ({
      department: department?.department_name,
      score: department?.avg_score,
    })),
  };

  const allDates = [
    ...new Set(
      Object.entries(performanceOverTime).flatMap(([key, value]) =>
        value.map((entry) => entry.created_on).filter(Boolean)
      )
    ),
  ];

  const sortedDates = [...allDates].sort((a, b) => new Date(a) - new Date(b));
  const selectedDates = sortedDates;

  const mergedData = selectedDates.map((date) => {
    const dataPoint = { date };
    Object.entries(performanceOverTime).forEach(([deptKey, entries]) => {
      const deptName = deptKey.replace("dept_", "").toUpperCase();
      const sameDayEntries = entries.filter((entry) => entry.created_on === date);
      if (sameDayEntries.length > 0) {
        const totalScore = sameDayEntries.reduce((sum, entry) => sum + entry.average_score, 0);
        const avgScore = totalScore / sameDayEntries.length;
        dataPoint[deptName] = Number(avgScore.toFixed(1));
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
                {barChartData.chartData?.length > 0 ? ( //Ensures data is not empty or null
                  <BarChartComponent data={barChartData} />
                ) : (
                  <p className="text-gray-500 text-lg font-semibold">No Data Available</p>
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md col-span-3">
                {departmentPerformanceData.chartData?.length > 0 ? ( //Ensures data is not empty or null
                  <MultiLineChartComponent data={departmentPerformanceData} />
                ) : (
                  <p className="text-gray-500 text-lg font-semibold">No Data Available</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5 mb-5 ml-5 mr-5">
              <TableComponent
                title="Top Performers"
                data={topPerformers.length > 0 ? topPerformers : []}
                type="overall"
              />
              {topPerformers.length === 0 && (
                <p className="text-gray-500 text-lg font-semibold text-center">No Data Available</p>
              )}

              <TableComponent
                title="Bottom Performers"
                data={bottomPerformers.length > 0 ? bottomPerformers : []}
                type="overall"
              />
              {bottomPerformers.length === 0 && (
                <p className="text-gray-500 text-lg font-semibold text-center">No Data Available</p>
              )}

              <div className="bg-white p-6 rounded-xl shadow-md">
                {participationRateData.chartData?.some((item) => item.value > 0) ? ( //Ensures data is not empty or null
                  <PieChartComponent data={participationRateData} />
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
