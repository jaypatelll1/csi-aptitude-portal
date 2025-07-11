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
  const [rankData, setRankData] = useState({});
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const sidebarRef = useRef(null);
  const detailsRef = useRef(null);
  
  const userData = useSelector((state) => state.user.user);
  const location = useLocation();
  const user_id = location.state?.user_id;
  const student_year = location.state?.year;

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
    if (!rank || rank === 0) {
      setter("");
      return;
    }
    
    const mod = rank % 10;
    if (mod === 1) setter("st");
    else if (mod === 2) setter("nd");
    else if (mod === 3) setter("rd");
    else setter("th");
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      const department_name = userData?.department_name || userData?.department;
      const year = student_year;
      
      const validationErrors = [];
      
      if (!user_id) validationErrors.push('Missing user_id');
      if (!department_name) validationErrors.push('Missing department_name');
      if (!year) validationErrors.push('Missing year');
      if (!API_BASE_URL) validationErrors.push('Missing API_BASE_URL');
      
      if (validationErrors.length > 0) {
        setError(`Validation failed: ${validationErrors.join(', ')}`);
        setLoading(false);
        return;
      }
      
      const url = `${API_BASE_URL}/api/analysis/student-analysis/${user_id}?department_name=${encodeURIComponent(department_name)}&year=${encodeURIComponent(year)}`;
      
      const res = await axios.get(url, {
        withCredentials: true,
        headers: { 
          "x-user-id": user_id,
          "Content-Type": "application/json"
        },
        timeout: 15000
      });
      
      if (!res.data) {
        setError('No data received from server');
        setLoading(false);
        return;
      }

      const responseData = res.data;
      setApiData(responseData);
      
      const results = responseData?.results || responseData;
      
      const overallResults = results?.overall_resultS || [];
      const avgResults = results?.avg_results || [];
      const performanceData = results?.performance_over_time || [];
      
      const rankInfo = {
        department_rank: results?.department_rank,
        overall_rank: results?.overall_rank,
        accuracy_rate: results?.accuracy_rate,
        completion_rate: results?.completion_rate,
        total_score: results?.total_score,
        max_score: results?.max_score,
        category: results?.category
      };
      
      setData(overallResults);
      setAvgData(avgResults);
      setRankData(rankInfo);
      setPerformanceOverTime(performanceData);
      console.log("Performance Data:", results);

      if (rankInfo && Object.keys(rankInfo).length > 0) {
        superscript(setDSup, rankInfo.department_rank);
        superscript(setOSup, rankInfo.overall_rank);
      }

      if (results?.completion_rate !== undefined) {
        const completionRate = Math.round(results.completion_rate * 100);
        
        setTestCompletionData({
          title: "Test Completion Rate",
          chartData: [
            { name: "Completed", value: completionRate, fill: "#1349C5" },
            { name: "Remaining", value: 100 - completionRate, fill: "#6F91F0" },
          ],
        });
      } else if (results?.test_completion_data) {
        const { attempted, total: totalTests } = results.test_completion_data;
        
        if (attempted !== undefined && totalTests !== undefined) {
          setTestCompletionData({
            title: "Test Completion Rate",
            chartData: [
              { name: "Completed", value: attempted, fill: "#1349C5" },
              { name: "Remaining", value: totalTests - attempted, fill: "#6F91F0" },
            ],
          });
        }
      }

      const hasData = overallResults.length > 0 || 
                      avgResults.length > 0 || 
                      performanceData.length > 0 ||
                      (rankInfo.department_rank && rankInfo.overall_rank) ||
                      results?.accuracy_rate !== undefined ||
                      results?.category !== undefined;
      
      setLoading(false);
      setRetryCount(0);
      setTimeout(() => setChartReady(true), 100);
      
    } catch (error) {
      let errorMessage = 'Failed to fetch data';
      
      if (error.response?.status === 404) {
        errorMessage = 'Student data not found';
      } else if (error.response?.status === 401) {
        errorMessage = 'Unauthorized access';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access forbidden';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchAllData();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user_id) {
        setLoading(false);
        setError('Missing user ID. Please navigate to this page with proper parameters.');
        return;
      }
      
      if (!userData) {
        setLoading(false);
        setError('User data not loaded. Please try refreshing the page.');
        return;
      }
      
      const departmentName = userData?.department_name || userData?.department;
      if (!departmentName) {
        setLoading(false);
        setError('Department information not available. Please check your profile settings.');
        return;
      }
      
      if (!student_year) {
        setLoading(false);
        setError('Student year information missing. Please navigate from student list.');
        return;
      }
      
      fetchAllData();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [user_id, userData, student_year]);

  useEffect(() => {
    let c = 0, t = 0;
    data.forEach((exam) => {
      if (exam?.total_score !== undefined && exam?.max_score !== undefined) {
        c += exam.total_score;
        t += exam.max_score;
      }
    });
    setCorrect(c);
    setTotal(t);
  }, [data]);

  const noData = data.length === 0 && 
                 avgData.length === 0 && 
                 performanceOverTime.length === 0 &&
                 (!rankData || (!rankData.department_rank && !rankData.overall_rank)) &&
                 !testCompletionData &&
                 !rankData?.accuracy_rate &&
                 !rankData?.category;

  const accuracyData = (() => {
    let accuracyRate = 0;
    
    if (rankData?.accuracy_rate !== undefined) {
      accuracyRate = Math.round(rankData.accuracy_rate * 100);
    } else if (rankData?.total_score !== undefined && rankData?.max_score !== undefined && rankData.max_score > 0) {
      accuracyRate = Math.round((rankData.total_score / rankData.max_score) * 100);
    } else if (total > 0) {
      accuracyRate = Math.round((correct / total) * 100);
    }
    
    return {
      title: "Accuracy Rate",
      chartData: [
        {
          name: "Correct",
          value: accuracyRate,
          fill: "#28A745",
        },
        {
          name: "Wrong",
          value: 100 - accuracyRate,
          fill: "#DC3545",
        },
      ],
    };
  })();

  const performanceOverTimeData = {
    title: "Performance Over Time",
    color: "#0703fc",
    chartData: performanceOverTime?.map((exam) => ({
     name: `${exam?.exam_name}`,
     Average: Math.round((exam?.score / exam?.max_score) * 100),
    })) || [],
  };

  const subjectPerformanceData = {
    title: "Topic-wise Performance",
    chartData: (() => {
      const categoryData = rankData?.category;
      
      if (!categoryData || typeof categoryData !== 'object') {
        return [];
      }
      
      return Object.entries(categoryData).map(([subject, categoryInfo]) => {
        const score = categoryInfo?.score || 0;
        const maxScore = categoryInfo?.max_score || 0;
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

  const getInitials = (name) => {
    if (!name) return "U";
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
            {getInitials(userData?.name)}
          </div>
          <div ref={detailsRef}>{isDetailsOpen && <Details />}</div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-[80vh]">
            <Loader />
           
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center h-[80vh]">
            <div className="text-center max-w-md">
              <div className="text-red-500 text-lg mb-2">⚠️ Error</div>
              <p className="text-gray-700 mb-4">{error}</p>
              
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mr-2"
              >
                Retry ({retryCount})
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        ) : noData ? (
          <div className="flex flex-col justify-center items-center h-[80vh]">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-4">📊</div>
              <p className="text-gray-500 text-lg mb-2">No Data Available</p>
              <p className="text-gray-400 text-sm mb-4">
                No analytics data found for this student
              </p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Student Analytics
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  className="mt-4"
                />
              </div>
              </div>
              <div className="bg-white shadow-lg rounded-lg p-5 border border-gray-200 mr-4 col-span-2 flex flex-col items-center">
                <div className="w-full">
                {chartReady && performanceOverTimeData.chartData.length > 0 ? (
                  <LineChartComponent
                    data={performanceOverTimeData}
                    xAxisKey="name"
                    lineDataKey="Average"
                    lineColor="#0703fc"
                  />
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow h-64 flex items-center justify-center">
                    <p className="text-gray-500">No performance data available</p>
                  </div>
                )}
              </div>
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-6 mt-6">
           <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col ml-4 items-center border border-gray-200 col-span-2">
                <DonutChartComponent data={accuracyData} />
              </div>
              
           <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 flex items-center justify-center col-span-3">
                {subjectPerformanceData.chartData.length > 0 ? (
                  <RadarChartComponent data={subjectPerformanceData} />
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow h-64 flex items-center justify-center">
                    <p className="text-gray-500">No subject performance data available</p>
                  </div>
                )}
              </div>
              
                <div className="bg-white shadow-lg rounded-lg p-6 border mr-4 border-gray-200 flex items-center justify-center col-span-2">
                {testCompletionData ? (
                  <PieChartComponent data={testCompletionData} />
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow h-64 flex items-center justify-center">
                    <p className="text-gray-500">No test completion data available</p>
                  </div>
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