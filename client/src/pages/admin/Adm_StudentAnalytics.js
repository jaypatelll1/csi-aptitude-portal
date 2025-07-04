
import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Details from "../../components/NavbarDetails";
import PieChartComponent from "../../components/analytics/PieChartComponent";
import LineChartComponent from "../../components/analytics/LineChartComponent";
import DonutChartComponent from "../../components/analytics/DonutChartComponent";
import RadarChartComponent from "../../components/analytics/RadarChartComponent";
import Dep_Sidebar from "../../components/department/Dep_Sidebar";
import DisplayComponent from "../../components/analytics/DisplayComponent";
import Loader from "../../components/Loader";
import { useSelector } from "react-redux";

function Dep_StudentAnalytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [testCompletionData, setTestCompletionData] = useState(null);
  const [data, setData] = useState([]);
  const [avgData, setAvgData] = useState([]);
  const [performanceOverTime, setPerformanceOverTime] = useState([]);
  const [dSup, setDSup] = useState("");
  const [oSup, setOSup] = useState("");
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [rankData, setRankData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);

  const sidebarRef = useRef(null);
  const detailsRef = useRef(null);
  const userData = useSelector((state) => state.user.user);
  const location = useLocation();
  const user_id = location.state?.user_id;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target))
        setSidebarOpen(false);
      if (detailsRef.current && !detailsRef.current.contains(event.target))
        setIsDetailsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const superscript = (setter, rank) => {
    const mod = rank % 10;
    if (mod === 1) setter("st");
    else if (mod === 2) setter("nd");
    else if (mod === 3) setter("rd");
    else setter("th");
  };

  const fetchAllData = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      const url = `${API_BASE_URL}/api/analysis/all-analysis`;
      const res = await axios.get(url, {
        withCredentials: true,
        headers: { "x-user-id": user_id },
      });

      setData(res.data?.overall_resultS || []);
      setAvgData(res.data?.avg_results || []);
      setRankData(res.data?.rank || {});

      if (res.data?.rank) {
        superscript(setDSup, res.data.rank.department_rank);
        superscript(setOSup, res.data.rank.overall_rank);
      }

      if (res.data?.test_completion_data) {
        const { attempted, total } = res.data.test_completion_data;
        setTestCompletionData({
          title: "Test Completion Rate",
          chartData: [
            { name: "Completed", value: attempted, fill: "#1349C5" },
            { name: "Remaining", value: total - attempted, fill: "#6F91F0" },
          ],
        });
      }

      setPerformanceOverTime(res.data?.performance_over_time || []);
      setLoading(false);
      setTimeout(() => setChartReady(true), 100);
    } catch (e) {
      console.error("Error fetching analytics:", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user_id) fetchAllData();
  }, [user_id]);

  useEffect(() => {
    let c = 0,
      t = 0;
    data.forEach((exam) => {
      c += exam.total_score;
      t += exam.max_score;
    });
    setCorrect(c);
    setTotal(t);
  }, [data]);

  const noData =
    data.length === 0 &&
    avgData.length === 0 &&
    performanceOverTime.length === 0;

  const accuracyData = {
    title: "Accuracy Rate",
    chartData: [
      {
        name: "Correct",
        value: total > 0 ? Math.round((correct / total) * 100) : 0,
        fill: "#28A745",
      },
      {
        name: "Wrong",
        value: total > 0 ? Math.round(100 - (correct / total) * 100) : 0,
        fill: "#DC3545",
      },
    ],
  };

  const performanceOverTimeData = {
    title: "Performance Over Time",
    color: "#0703fc",
    chartData:
      performanceOverTime?.map((e) => ({
        name: e?.created_on,
        Average: e?.average_score,
      })) || [],
  };

  const subjectPerformanceData = {
    title: "Topic-wise Performance",
    chartData: (() => {
      const valid = data.filter((e) => e.category);
      const subjects = [
        ...new Set(
          valid.flatMap((e) =>
            Object.keys(e.category).filter((s) => s !== "null"),
          ),
        ),
      ];
      return subjects.map((subject) => {
        const totalScore = valid.reduce(
          (sum, e) => sum + (parseFloat(e.category[subject]?.score) || 0),
          0,
        );
        const totalMax = valid.reduce(
          (sum, e) => sum + (parseFloat(e.category[subject]?.max_score) || 0),
          0,
        );
        return {
          name: subject,
          yourScore: totalScore,
          average:
            totalMax > 0
              ? parseFloat(((totalScore / totalMax) * 100).toFixed(2))
              : 0,
          maxMarks: totalMax,
        };
      });
    })(),
    colors: { yourScore: "#1349C5", average: "#6A88F7", maxMarks: "#D3D3D3" },
  };

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    return (parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "");
  };

  return (
    <div className="min-h-screen flex bg-gray-100 overflow-x-hidden">
      <div
        ref={sidebarRef}
        className="fixed top-0 left-0 h-full bg-gray-50 w-64 shadow-lg z-50"
      >
        <Dep_Sidebar />
      </div>
      <div className="flex flex-col flex-1 xl:ml-64">
        <div className="bg-white h-14 border-b border-gray-200 flex items-center px-6 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="xl:hidden text-gray-800"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
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
          <div
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            className="ml-auto h-9 w-9 rounded-full bg-blue-300 flex items-center justify-center text-blue-700 text-sm cursor-pointer"
          >
            {getInitials(userData.name)}
          </div>
          <div ref={detailsRef}>{isDetailsOpen && <Details />}</div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[80vh]">
            <Loader />
          </div>
        ) : noData ? (
          <div className="flex justify-center items-center h-[80vh]">
            <p className="text-gray-500 text-lg">No Data Available</p>
          </div>
        ) : (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <DisplayComponent
                  title="Department Rank"
                  rank={rankData?.department_rank}
                  superscript={dSup}
                />
                <DisplayComponent
                  title="Overall Rank"
                  rank={rankData?.overall_rank}
                  superscript={oSup}
                  className="mt-4"
                />
              </div>
              <div className="md:col-span-2">
                {chartReady && (
                  <LineChartComponent
                    data={performanceOverTimeData}
                    xAxisKey="name"
                    lineDataKey="Average"
                    lineColor="#0703fc"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-6 mt-6">
              <div className="col-span-2">
                <DonutChartComponent data={accuracyData} />
              </div>
              <div className="col-span-3">
                {subjectPerformanceData.chartData.length > 0 ? (
                  <RadarChartComponent data={subjectPerformanceData} />
                ) : (
                  <p className="text-center text-gray-500">No Data Available</p>
                )}
              </div>
              <div className="col-span-2">
                {testCompletionData ? (
                  <PieChartComponent data={testCompletionData} />
                ) : (
                  <p className="text-center text-gray-500">
                    Loading Test Completion Data...
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dep_StudentAnalytics;
