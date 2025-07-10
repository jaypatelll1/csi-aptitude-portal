// Updated Adm_StudentAnalytics with:
// - Smooth chart animation using chartReady
// - Full-page "No Data Available" fallback if no data for student
// - Clean, maintainable structure
// - FIXED: Cannot read properties of undefined (reading 'length') error

import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Details from "../../components/NavbarDetails";
import PieChartComponent from "../../components/analytics/PieChartComponent";
import LineChartComponent from "../../components/analytics/LineChartComponent";
import DonutChartComponent from "../../components/analytics/DonutChartComponent";
import RadarChartComponent from "../../components/analytics/RadarChartComponent";
import DisplayComponent from "../../components/analytics/DisplayComponent";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import Loader from "../../components/Loader";
import { useSelector } from "react-redux";

function Adm_StudentAnalytics() {
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
  const [studentName, setStudentName] = useState("");
  const [department, setDepartment] = useState("");
  const [chartReady, setChartReady] = useState(false);

  const sidebarRef = useRef(null);
  const detailsRef = useRef(null);
  const userData = useSelector((state) => state.user.user);
  const location = useLocation();
  const user_id = location.state?.user_id;

  const getInitials = (name) => {
    if (!name) return "";
    const nameParts = name.trim().split(" ");
    const firstInitial = nameParts[0]?.charAt(0) || "";
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0) : "";
    return (firstInitial + lastInitial).toUpperCase();
  };

  const superscript = (setter, rank) => {
    const condition = rank % 10;
    if (condition === 1) setter("st");
    else if (condition === 2) setter("nd");
    else if (condition === 3) setter("rd");
    else setter("th");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
      if (detailsRef.current && !detailsRef.current.contains(event.target)) {
        setIsDetailsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAllData = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
    const url = `${API_BASE_URL}/api/analysis/user/${user_id}`;
      const response = await axios.get(url, {
        withCredentials: true,
        headers: { "x-user-id": user_id },
      });

      // Handle the new JSON structure
      const result = response.data?.result;
      console.log("API Response:", response.data);
      setStudentName(result?.student_name || "Student Name Not Available");
      setDepartment(result?.department_name || "");
      
      // Convert single result to array format for compatibility
      const resultArray = result ? [result] : [];
      setData(resultArray);
      setAvgData(response.data?.avg_results || []);
      setRankData(response.data?.rank || []);
      
      if (response.data.rank) {
        superscript(setDSup, response.data.rank.department_rank);
        superscript(setOSup, response.data.rank.overall_rank);
      }
      setPerformanceOverTime(result?.performance_over_time || []);
      
      // Handle test completion data from the result
      if (result?.total_score && result?.max_score) {
        const completionRate = parseFloat(result.total_score / result.max_score);
        setTestCompletionData({
          title: "Test Completion Rate",
          chartData: [
            { name: "Completed", value: Math.round(completionRate * 100), fill: "#1349C5" },
            { name: "Remaining", value: Math.round((1 - completionRate) * 100), fill: "#6F91F0" },
          ],
        });
      }
      
      setLoading(false);
      setTimeout(() => setChartReady(true), 100);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user_id) {
      fetchAllData();
    }
  }, [user_id]);

  useEffect(() => {
    setCorrect(0);
    setTotal(0);
    if (data && Array.isArray(data)) {
      data.forEach((result) => {
        if (result.category) {
          // Calculate total score and max score from category data
          Object.values(result.category).forEach((category) => {
            setCorrect((prev) => prev + (category.score || 0));
            setTotal((prev) => prev + (category.max_score || 0));
          });
        }
      });
    }
  }, [data]);

  const noDataAvailable =

    (!performanceOverTime || performanceOverTime.length === 0);

  const performanceOverTimeData = {
    title: "Performance Over Time",
    color: "#0703fc",
    chartData: performanceOverTime?.map((exam) => ({
      name: `Exam ${exam?.exam_id}`,
      Average: Math.round((exam?.score / exam?.max_score) * 100),
    })) || [],
  };

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
        value: total > 0 ? Math.round(((total - correct) / total) * 100) : 0,
        fill: "#DC3545",
      },
    ],
  };

  const subjectPerformanceData = {
    title: "Topic-wise Performance",
    chartData: (() => {
      if (!data || !Array.isArray(data) || data.length === 0) return [];
      
      const result = data[0]; // Get the first (and likely only) result
      if (!result.category) return [];
      
      return Object.entries(result.category).map(([subject, categoryData]) => {
        const score = categoryData.score || 0;
        const maxScore = categoryData.max_score || 0;
        const percentage = maxScore > 0 ? parseFloat(((score / maxScore) * 100).toFixed(2)) : 0;
        
        return { 
          name: subject, 
          yourScore: score, 
          average: percentage, 
          maxMarks: maxScore 
        };
      });
    })(),
    colors: { yourScore: "#1349C5", average: "#6A88F7", maxMarks: "#D3D3D3" },
  };

  return (
    <div className="min-h-screen flex bg-gray-100 mb-4 overflow-x-hidden">
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-50 z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
        } transition-transform duration-300 w-64 xl:block shadow-lg`}
      >
        <Adm_Sidebar />
      </div>
      <div className="flex flex-col flex-1 xl:ml-64">
        <div className="bg-white h-14 border-b border-gray-200 flex items-center px-6 shadow-sm">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="xl:hidden text-gray-800">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          <div
            className="h-9 w-9 rounded-full bg-blue-300 ml-auto flex items-center justify-center text-blue-700 text-sm hover:cursor-pointer"
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          >
            {getInitials(userData.name)}
          </div>
          <div ref={detailsRef}>{isDetailsOpen && <Details />}</div>
        </div>

        {loading || !chartReady ? (
          <div className="flex items-center justify-center h-screen">
            <Loader />
          </div>
        ) : noDataAvailable ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-500 text-lg">No Data Available</p>
          </div>
        ) : (
           <>
            {/* Header with Analytics title and Student name */}
            <div className="flex items-center justify-between mt-5 mx-5">
              <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
              <div className="text-right flex gap-6 items-end">
                <p className="text-xl font-bold text-blue-600">{department}</p>

                <p className="text-xl font-bold text-blue-600">{studentName}</p>
              </div>
            </div>

            {/* Analytics Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-6 mt-6">
              {!loading && (
                <div>
                  <div className="bg-white shadow-lg rounded-lg p-10 flex flex-col items-center ml-4 border border-gray-200">
                    <DisplayComponent
                      title="Department Rank"
                      rank={rankData?.department_rank}
                      superscript={dSup}
                    />
                  </div>
                  <div className="bg-white shadow-lg rounded-lg p-10 flex flex-col items-center ml-4 mt-4 border border-gray-200">
                    <DisplayComponent
                      title="Overall Rank"
                      rank={rankData?.overall_rank}
                      superscript={oSup}
                    />
                  </div>
                </div>
              )}

              <div className="bg-white shadow-lg rounded-lg p-5 border border-gray-200 mr-4 col-span-2 flex flex-col items-center">
                <div className="w-full">
                  <LineChartComponent
                    data={performanceOverTimeData}
                    xAxisKey="name"
                    lineDataKey="value"
                    lineColor="#0703fc"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-6 mt-6 mb-8">
              <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col ml-4 items-center border border-gray-200 col-span-2">
                <DonutChartComponent data={accuracyData} />
              </div>

              <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 flex items-center justify-center col-span-3">
                {subjectPerformanceData.chartData.length > 0 ? (
                  <RadarChartComponent data={subjectPerformanceData} />
                ) : (
                  <p className="text-center text-gray-500">No Data Available</p>
                )}
              </div>

              <div className="bg-white shadow-lg rounded-lg p-6 border mr-4 border-gray-200 flex items-center justify-center col-span-2">
                {testCompletionData ? (
                  <PieChartComponent data={testCompletionData} />
                ) : (
                  <p className="text-center text-gray-500">Loading Test Completion Data...</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Adm_StudentAnalytics;