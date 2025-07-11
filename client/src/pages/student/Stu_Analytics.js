import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import Stu_Sidebar from "../../components/student/Stu_Sidebar";
import Details from "../../components/NavbarDetails";
import PieChartComponent from "../../components/analytics/PieChartComponent";
import LineChartComponent from "../../components/analytics/LineChartComponent";
import DonutChartComponent from "../../components/analytics/DonutChartComponent";
import RadarChartComponent from "../../components/analytics/RadarChartComponent";
import DisplayComponent from "../../components/analytics/DisplayComponent";
import Loader from "../../components/Loader";

function Stu_Analytics() {
  const [userName, setUserName] = useState("");
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
  const [categoryData, setCategoryData] = useState(null);
  const [hasData, setHasData] = useState(false); // New state to track if any data exists
  const [apiError, setApiError] = useState(null); // Track API errors
  
  // Get user data from Redux store
  const user = useSelector((state) => state.user.user);
  
  // Use user's actual department and year from profile
  const [selectedDepartment, setSelectedDepartment] = useState(user?.department);
  const [selectedYear, setSelectedYear] = useState(user?.year);

  const sidebarRef = useRef(null);
  const detailsRef = useRef(null);
  const location = useLocation();
  const user_id = location.state?.user_id || user?.id;

  // Update selected values when user data changes
  useEffect(() => {
    if (user?.department) {
      setSelectedDepartment(user.department);
    }
    if (user?.year) {
      setSelectedYear(user.year);
    }
    if (user?.name) {
      setUserName(user.name);
    }
  }, [user]);

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

  const getInitials = (name) => {
    if (!name) return "S";
    const words = name.trim().split(" ");
    return words.length === 1
      ? words[0][0].toUpperCase()
      : (words[0][0] + words[1][0]).toUpperCase();
  };

  const superscript = (changeUsestateValue, rank) => {
    const condition = rank % 10;
    if (condition === 1) changeUsestateValue("st");
    else if (condition === 2) changeUsestateValue("nd");
    else if (condition === 3) changeUsestateValue("rd");
    else changeUsestateValue("th");
  };

  // Dynamic URL building function
  const buildApiUrl = (userId, departmentName, year) => {
    const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
    const params = new URLSearchParams({
      department_name: departmentName,
      year: year
    });
    
    return `${API_BASE_URL}/api/analysis/student-analysis/${userId}?${params.toString()}`;
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setApiError(null);
      setHasData(false);
      
      // Build the dynamic URL using actual user data
      const url = buildApiUrl(user_id, selectedDepartment, selectedYear);
      console.log("API URL:", url);
      
      const response = await axios.get(url, {
        withCredentials: true,
        headers: { "x-user-id": user_id },
      });
      
      console.log("Full API Response:", response.data);
      
      // Access the results from the response
      const apiData = response.data.results || response.data;
      
      if (apiData && Object.keys(apiData).length > 0) {
        let dataFound = false;
        
        // Set basic data
        if (apiData.overall_results && apiData.overall_results.length > 0) {
          setData(apiData.overall_results);
          dataFound = true;
        }
        
        if (apiData.avg_results && apiData.avg_results.length > 0) {
          setAvgData(apiData.avg_results);
          dataFound = true;
        }
        
        // Extract and set category data
        if (apiData.category && Object.keys(apiData.category).length > 0) {
          setCategoryData(apiData.category);
          console.log("Category data:", apiData.category);
          dataFound = true;
        }
        
        // Set rank data
        const rankInfo = {
          department_rank: apiData.department_rank || 0,
          overall_rank: apiData.overall_rank || 0
        };
        setRankData(rankInfo);
        
        // If we have valid ranks, consider it as data
        if (apiData.department_rank > 0 || apiData.overall_rank > 0) {
          dataFound = true;
        }
        
        // Set superscripts for ranks
        if (apiData.department_rank) {
          superscript(setDSup, apiData.department_rank);
        }
        if (apiData.overall_rank) {
          superscript(setOSup, apiData.overall_rank);
        }
        
        // Set username if available (fallback to user from Redux)
        if (apiData.name) {
          setUserName(apiData.name);
        } else if (user?.name) {
          setUserName(user.name);
        }
        
        // Handle performance over time data
        if (apiData.performance_over_time && Array.isArray(apiData.performance_over_time)) {
          console.log("Raw performance_over_time data:", apiData.performance_over_time);
          
          const validPerformanceData = apiData.performance_over_time
            .filter(item => {
              return item && 
                     typeof item === 'object' && 
                     Object.keys(item).length > 0 && 
                     item.hasOwnProperty('score') && 
                     item.hasOwnProperty('max_score') &&
                     item.hasOwnProperty('exam_id');
            })
            .map((item, index) => {
              const score = item.score || 0;
              const maxScore = item.max_score || 1;
              const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
              
              const examName = item.exam_name || `Exam ${item.exam_id}`;
              
              return {
                name: examName,
                value: percentage,
                score: score,
                max_score: maxScore,
                exam_id: item.exam_id,
                tooltipLabel: `${examName}: ${score}/${maxScore} (${percentage}%)`
              };
            })
            .sort((a, b) => a.exam_id - b.exam_id);
          
          console.log("Processed performance data:", validPerformanceData);
          setPerformanceOverTime(validPerformanceData);
          
          if (validPerformanceData.length > 0) {
            dataFound = true;
          }
        } else {
          console.log("No valid performance_over_time data found");
          setPerformanceOverTime([]);
        }
        
        // Calculate test completion data
        if (apiData.completion_rate !== undefined && apiData.completion_rate !== null) {
          const completionRate = apiData.completion_rate || 0;
          const attempted = Math.round(completionRate * 100);
          const remaining = 100 - attempted;
          
          setTestCompletionData({
            title: "Test Completion Rate",
            chartData: [
              { name: "Completed", value: attempted, fill: "#1349C5" },
              { name: "Remaining", value: remaining, fill: "#6F91F0" },
            ],
          });
          dataFound = true;
        }
        
        // Set correct and total scores
        if (apiData.total_score !== undefined || apiData.max_score !== undefined) {
          setCorrect(apiData.total_score || 0);
          setTotal(apiData.max_score || 0);
          if (apiData.total_score > 0 || apiData.max_score > 0) {
            dataFound = true;
          }
        }
        
        // Update hasData state
        setHasData(dataFound);
        
        if (!dataFound) {
          console.log("No meaningful data found in API response");
        }
        
      } else {
        console.warn("No data received from API or empty response");
        setHasData(false);
      }
      
      setLoading(false);
      setTimeout(() => setChartReady(true), 100);
    } catch (error) {
      console.error("Error fetching data:", error);
      console.error("Error details:", error.response?.data || error.message);
      setApiError(error.response?.data?.message || error.message || "Failed to fetch data");
      setHasData(false);
      setLoading(false);
    }
  };

  // Initial data fetch - wait for user data to be available
  useEffect(() => {
    if (user_id && selectedDepartment && selectedYear) {
      fetchAllData();
    }
  }, [user_id, selectedDepartment, selectedYear]);

  // Performance over time data processing
  const performanceOverTimeData = {
    title: "Performance Over Time",
    color: "#0703fc",
    chartData: performanceOverTime.map(item => ({
      name: item.name,
      Average: item.value,
      score: item.score,
      max_score: item.max_score,
      exam_id: item.exam_id,
      tooltipLabel: item.tooltipLabel
    })),
    yAxisLabel: "Score (%)",
    xAxisLabel: "Exams",
    showTooltip: true,
    showDots: true,
    strokeWidth: 2
  };

  // Calculate average score for reference line
  const averageScore = performanceOverTime.length > 0 
    ? Math.round(performanceOverTime.reduce((sum, item) => sum + item.value, 0) / performanceOverTime.length)
    : 0;

  // Accuracy data calculation
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

  // Subject performance data from category
  const subjectPerformanceData = {
    title: "Topic-wise Performance",
    chartData: (() => {
      if (!categoryData || typeof categoryData !== 'object') return [];
      
      const result = [];
      
      Object.entries(categoryData).forEach(([categoryName, categoryDetails]) => {
        if (typeof categoryDetails === 'object' && categoryDetails !== null && 
            categoryDetails.hasOwnProperty('score') && categoryDetails.hasOwnProperty('max_score')) {
          
          const displayName = categoryName.replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
          
          result.push({
            name: displayName,
            yourScore: categoryDetails.score || 0,
            maxMarks: categoryDetails.max_score || 0,
          });
        }
      });
      
      return result;
    })(),
    colors: {
      yourScore: "#1349C5",
      average: "#6A88F7",
      maxMarks: "#D3D3D3",
    },
  };

  // Enhanced No Data Available Component
  const NoDataScreen = () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-6">
          <svg 
            className="w-24 h-24 mx-auto text-gray-300 mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Analytics Data Available</h3>
        <p className="text-gray-500 text-sm mb-4">
          {apiError 
            ? `Error: ${apiError}` 
            : "We couldn't find any analytics data for your current selection."
          }
        </p>
        <div className="text-xs text-gray-400 space-y-1">
          <p>• Make sure you have completed some tests</p>
          <p>• Check if your department and year are correct</p>
          <p>• Try refreshing the page</p>
        </div>
        <button 
          onClick={fetchAllData}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-100 mb-4 overflow-x-hidden">
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
        } transition-transform duration-300 w-64 xl:block shadow-lg`}
      >
        <Stu_Sidebar />
      </div>

      <div className="flex flex-col flex-1 xl:ml-64">
        <div className="bg-white h-14 border-b border-gray-200 flex items-center px-6 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="xl:hidden text-gray-800 focus:outline-none"
          >
            <svg
              className="w-8 h-8"
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

          <div
            className="h-9 w-9 rounded-full bg-blue-300 ml-auto flex items-center justify-center text-blue-700 text-sm font-semibold hover:cursor-pointer"
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          >
            {getInitials(userName)}
          </div>
          <div ref={detailsRef}>{isDetailsOpen && <Details />}</div>
        </div>

        <div className="p-6">
          {loading || !chartReady ? (
            <div className="flex items-center justify-center h-96">
              <Loader />
            </div>
          ) : !hasData ? (
            <NoDataScreen />
          ) : (
            <>
              <div className="flex justify-between items-center mt-5 ml-5">
                <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
              </div>

              {/* Dashboard Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-6 mt-6">
                {/* Rank Display */}
                <div className="">
                  <div className="bg-white shadow-lg rounded-lg p-10 flex flex-col items-center ml-4 border border-gray-200">
                    <DisplayComponent
                      title="Department Rank"
                      rank={rankData?.department_rank || "N/A"}
                      superscript={dSup}
                    />
                  </div>
                  <div className="bg-white shadow-lg rounded-lg p-10 flex flex-col items-center ml-4 mt-4 border border-gray-200">
                    <DisplayComponent
                      title="Overall Rank"
                      rank={rankData?.overall_rank || "N/A"}
                      superscript={oSup}
                    />
                  </div>
                </div>

                {/* Line Chart - Performance Over Time */}
                <div className="bg-white shadow-lg rounded-lg p-5 border border-gray-200 mr-4 col-span-2 flex flex-col items-center">
                  <div className="w-full">
                    {performanceOverTime && performanceOverTime.length > 0 ? (
                      <LineChartComponent
                        data={performanceOverTimeData}
                        xAxisKey="name"
                        lineDataKey="value"
                        lineColor="#0703fc"
                        showDots={true}
                        strokeWidth={2}
                        tooltipFormatter={(value, name, props) => {
                          if (props && props.payload) {
                            const data = props.payload;
                            return [
                              `Score: ${data.score}/${data.max_score}`,
                              `Percentage: ${value}%`
                            ];
                          }
                          return [`${value}%`];
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-48">
                        <p className="text-gray-500">No performance data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-6 mt-6 mb-8">
                {/* Accuracy Rate - Donut Chart */}
                <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col ml-4 items-center border border-gray-200 col-span-2">
                  <DonutChartComponent data={accuracyData} />
                </div>

                {/* Subject-wise Performance - Radar Chart */}
                <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 flex items-center justify-center col-span-3">
                  {subjectPerformanceData.chartData && subjectPerformanceData.chartData.length > 0 ? (
                    <RadarChartComponent data={subjectPerformanceData} />
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-500">No Subject Data Available</p>
                      {categoryData && (
                        <p className="text-xs text-gray-400 mt-2">
                          Raw category data found but not in expected format
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Test Completion Rate - Pie Chart */}
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
    </div>
  );
}

export default Stu_Analytics;