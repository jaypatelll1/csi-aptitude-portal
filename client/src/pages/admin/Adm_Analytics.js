import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Adm_Navbar from "../../components/admin/Adm_Navbar";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import BarChartComponent from "../../components/analytics/BarChartComponent";
import RadarChartComponent from "../../components/analytics/RadarChartComponent";
import DonutChartComponent from "../../components/analytics/DonutChartComponent";
import LineChartComponent from "../../components/analytics/LineChartComponent";
import PieChartComponent from "../../components/analytics/PieChartComponent";
import TableComponent from "../../components/analytics/TableComponent";
import DisplayComponent from "../../components/analytics/DisplayComponent";
import Loader from "../../components/Loader";

function Adm_Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const departments = ["CMPN", "INFT", "EXTC", "ECS", "ELEC"];
  const [accuracyData, setAccuracyData] = useState([]);
  const [categoryWiseData, setCategoryWiseData] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("CMPN");
  const [topPerformers, setTopPerformers] = useState([]);
  const [bottomPerformers, setBottomPerformers] = useState([]);
  const [participationRate, setParticipationRate] = useState([]);
  const [performanceOverTime, setPerformanceOverTime] = useState([]);
  const [deptRank, setDeptRank] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentCount, setStudentCount] = useState(0);
  const [dSup, setDSup] = useState("");
  const [error, setError] = useState(null);
  const [hasData, setHasData] = useState(false);
  const departmentDataTimerRef = useRef(null);

  // Fixed Function to check if any meaningful data exists
  const checkDataAvailability = (data) => {
    console.log("Checking data availability:", data);
    
    if (!data || !data.result || data.result.length === 0) {
      console.log("No data.result or empty array");
      return false;
    }
    
    // Check if there's at least one department with meaningful data
    const hasData = data.result.some(dept => {
      console.log("Checking dept:", dept.department_name, {
        accuracy_rate: dept.accuracy_rate,
        total_score: dept.total_score,
        student_count: dept.student_count,
        performance_over_time: dept.performance_over_time,
        subject_performance: dept.subject_performance
      });
      
      // Check if any of these properties exist and are not null/undefined
      // Note: 0 is a valid value for scores and rates
      return (
        dept.accuracy_rate !== null && dept.accuracy_rate !== undefined
      ) || (
        dept.total_score !== null && dept.total_score !== undefined
      ) || (
        dept.student_count !== null && dept.student_count !== undefined && dept.student_count >= 0
      ) || (
        dept.performance_over_time && Array.isArray(dept.performance_over_time) && dept.performance_over_time.length > 0
      ) || (
        dept.subject_performance && typeof dept.subject_performance === 'object' && Object.keys(dept.subject_performance).length > 0
      );
    });
    
    console.log("Data availability result:", hasData);
    return hasData;
  };

  // Improved Process the new API response format
  const processApiResponse = (apiData) => {
    if (!apiData || !apiData.result) {
      console.log("No apiData or apiData.result");
      return null;
    }

    console.log("Processing API data for department:", selectedDepartment);
    console.log("Available departments:", apiData.result.map(d => d.department_name));

    // Find the department data (there might be multiple entries for different years)
    const departmentData = apiData.result.filter(dept => 
      dept.department_name === selectedDepartment
    );

    console.log("Filtered department data:", departmentData);

    if (departmentData.length === 0) {
      console.log("No data found for department:", selectedDepartment);
      return null;
    }

    // Use the first entry if multiple exist, or aggregate if needed
    const deptData = departmentData[0]; // For now, just use the first entry
    
    // Create the aggregated data structure
    const aggregatedData = {
      accuracy_rate: deptData.accuracy_rate || 0,
      category_performance: [],
      top_performer: [], // You might need to fetch this separately
      bottom_performer: [], // You might need to fetch this separately
      participation_rate: 100, // Calculate based on your logic
      performance_over_time: deptData.performance_over_time || [],
      dept_ranks: { department_rank: deptData.department_rank || null },
      studentCount: { student_count: deptData.student_count || 0 }
    };

    // Process subject performance data
    if (deptData.subject_performance && typeof deptData.subject_performance === 'object') {
      aggregatedData.category_performance = Object.keys(deptData.subject_performance).map(subject => {
        const subjectData = deptData.subject_performance[subject];
        const score = subjectData.score || 0;
        const maxScore = subjectData.max_score || 1; // Avoid division by zero
        
        return {
          category: subject,
          average_category_score: maxScore > 0 ? (score / maxScore) * 100 : 0,
          max_category_score: 100
        };
      });
    }

    // Format performance over time data
    if (deptData.performance_over_time && Array.isArray(deptData.performance_over_time)) {
      aggregatedData.performance_over_time = deptData.performance_over_time.map((exam, index) => ({
        exam_id: exam.exam_id || `exam_${index + 1}`,
        created_on: exam.created_on || `Exam ${index + 1}`,
        average_score: exam.avg_score || exam.average_score || 0
      }));
    }

    console.log("Processed aggregated data:", aggregatedData);
    return aggregatedData;
  };

  // Fetch department data function
  const fetchDepartmentData = async (department) => {
    try {
      setIsLoading(true);
      setError(null);
      setHasData(false);

      // Clear any existing timers
      if (departmentDataTimerRef.current) {
        clearTimeout(departmentDataTimerRef.current);
      }

      departmentDataTimerRef.current = setTimeout(() => {
        setIsLoading(false);
        setError(`Request timeout - Unable to fetch ${department} data`);
        setHasData(false);
      }, 30000);

      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      const response = await axios.get(
        `${API_BASE_URL}/api/analysis/department/${department}`,
        { withCredentials: true }
      );

      // Clear timer on successful response
      if (departmentDataTimerRef.current) {
        clearTimeout(departmentDataTimerRef.current);
        departmentDataTimerRef.current = null;
      }

      if (!response.data) {
        setError(`No data available for ${department} department`);
        setIsLoading(false);
        setHasData(false);
        return;
      }

      // Process the response data
      const rawData = response.data;
      console.log("Raw API Response:", rawData);
      
      // Check if meaningful data exists
      const dataExists = checkDataAvailability(rawData);
      if (!dataExists) {
        setError(`No meaningful data available for ${department} department`);
        setIsLoading(false);
        setHasData(false);
        return;
      }

      // Process the API response to match the expected format
      const processedData = processApiResponse(rawData);
      
      if (!processedData) {
        setError(`No data available for ${department} department`);
        setIsLoading(false);
        setHasData(false);
        return;
      }

      console.log("Processed Data:", processedData);
      
      setHasData(true);
      setCategoryWiseData(processedData.category_performance || []);
      setTopPerformers(processedData.top_performer || []);
      setBottomPerformers(processedData.bottom_performer || []);
      setParticipationRate(processedData.participation_rate || 0);
      setAccuracyData(processedData.accuracy_rate || 0);
      setPerformanceOverTime(processedData.performance_over_time || []);
      setDeptRank(processedData.dept_ranks || {});
      
      if (processedData.dept_ranks?.department_rank) {
        superscript(setDSup, processedData.dept_ranks.department_rank);
      }
      
      setStudentCount(processedData.studentCount?.student_count || 0);
      setError(null);
      setIsLoading(false);
      console.log("studentCount:", processedData.studentCount?.student_count || 0);

    } catch (err) {
      console.error("Error fetching department data:", err);

      // Clear timer on error
      if (departmentDataTimerRef.current) {
        clearTimeout(departmentDataTimerRef.current);
        departmentDataTimerRef.current = null;
      }

      setIsLoading(false);
      setError(`Failed to fetch ${department} department analysis`);
      setHasData(false);
      
      // Reset all data states on error
      setCategoryWiseData([]);
      setTopPerformers([]);
      setBottomPerformers([]);
      setParticipationRate(0);
      setAccuracyData(0);
      setPerformanceOverTime([]);
      setDeptRank({});
      setStudentCount(0);
      setDSup("");
    }
  };

  // Handle department change
  const handleDepartmentChange = (dept) => {
    setSelectedDepartment(dept);
    setError(null);
  };

  // Fix: Simplified useEffect - removed initialLoad logic
  useEffect(() => {
    fetchDepartmentData(selectedDepartment);

    // Cleanup function
    return () => {
      if (departmentDataTimerRef.current) {
        clearTimeout(departmentDataTimerRef.current);
      }
    };
  }, [selectedDepartment]); // Only depend on selectedDepartment

  const filteredAccuracyData = [
    {
      name: "Correct",
      value: Number(accuracyData) * 100,
      fill: "#4CAF50",
    },
    {
      name: "Wrong",
      value: 100 - (Number(accuracyData) * 100),
      fill: "#F44336",
    },
  ];

  const performanceOverTimeData = {
    title: "Performance Over Time",
    color: "#0703fc",
    chartData: performanceOverTime?.map((exam) => ({
      name: exam?.created_on,
      Average: exam?.average_score,
    })),
  };

  const donutChartData = {
    title: "Accuracy Rate",
    chartData:
      filteredAccuracyData?.length > 0 && Number(accuracyData) >= 0
        ? filteredAccuracyData
        : [
          { name: "Correct", value: 0, fill: "#4CAF50" },
          { name: "Wrong", value: 100, fill: "#F44336" },
        ],
  };

  const participationRateData = {
    title: "Participation Rate",
    chartData: [
      {
        name: "Participated",
        value: Number(participationRate) || 0,
        fill: "#1349C5",
      },
      {
        name: "Not Participated",
        value: Number(100 - participationRate).toFixed(2) || 100,
        fill: "#6F91F0",
      },
    ],
  };

  const radarChartData = {
    title: "Subject-wise Performance",
    chartData: categoryWiseData
      ?.filter((category) => category?.category != null && category?.category !== "null")
      .map((category) => ({
        name: category?.category,
        yourScore: Number(category?.average_category_score).toFixed(2) || 0,
        maxMarks: Number(category?.max_category_score) || 100,
      })),
  };

  const superscript = (changeUsestateValue, rank) => {
    const condition = rank % 10;
    if (condition === 1) changeUsestateValue("st");
    else if (condition === 2) changeUsestateValue("nd");
    else if (condition === 3) changeUsestateValue("rd");
    else changeUsestateValue("th");
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

  // No Data Available Component
  const NoDataAvailable = () => (
    <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow-lg mx-5 mt-5">
      <div className="text-center p-8">
        <svg 
          className="mx-auto h-24 w-24 text-gray-400 mb-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
          />
        </svg>
        <h3 className="text-2xl font-semibold text-gray-700 mb-2">
          No Analytics Data Available
        </h3>
        <p className="text-gray-500 text-lg mb-4">
          There is currently no analytics data available for the <strong>{selectedDepartment}</strong> department.
        </p>
        <p className="text-gray-400 text-sm">
          Please check back later or contact your administrator if this issue persists.
        </p>
        <button 
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => {fetchDepartmentData(selectedDepartment)}}
        >
          REFRESH
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex overflow-x-hidden bg-white">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-100 z-50 border-r-2 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Adm_Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full bg-gray-100">
        <Adm_Navbar />

        {/* Header with department buttons - always show */}
        <div className="flex items-center justify-between mt-8">
          <button
            className="xl:hidden text-gray-800 -mt-40 ml-3"
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
          <h1 className="text-3xl font-bold text-gray-800 xl:ml-7 md">Branch Analytics</h1>
          <div className="flex justify-center space-x-4 mr-10">
            {departments.map((dept) => (
              <button
                key={dept}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${selectedDepartment === dept
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-300 text-gray-800"
                  }`}
                onClick={() => handleDepartmentChange(dept)}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Show error message if there's an error */}
        {error && !isLoading && (
          <div className="flex items-center justify-center h-32 mx-5 mt-5">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Fix: Better loading state that doesn't cover the entire screen */}
        {isLoading ? (
          <div className="flex ">
            <div className="bg-white rounded-lg  h-screen">
              <Loader />
             
            </div>
          </div>
        ) : !hasData && !error ? (
          
          <NoDataAvailable />
        ) : hasData ? (
          // Show Analytics Dashboard UI only when data is available
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-5 mt-5 mb-5 ml-5 mr-5 ">
              <div>
                <div className="bg-white shadow-lg rounded-lg p-10 flex flex-col items-center border border-gray-200">
                  <DisplayComponent
                    title="Department Rank"
                    rank={deptRank?.department_rank || "No Data"}
                    superscript={dSup}
                  />
                </div>
                <div className="bg-white shadow-lg rounded-lg p-10 flex flex-col items-center mt-4 border border-gray-200">
                  <DisplayComponent title="Total Students" rank={studentCount || "No Data"} />
                </div>
              </div>
              <div className="bg-white shadow-lg rounded-lg p-5 border border-gray-200 flex-grow flex flex-col items-center col-span-2">
                {performanceOverTime?.length > 0 ? (
                  <LineChartComponent
                    data={performanceOverTimeData}
                    xAxisKey="name"
                    lineDataKey="Average"
                  />
                ) : (
                  <p className="text-gray-500 text-lg font-semibold">No Performance Data Available</p>
                )}
              </div>
            </div>

            {/* Other Components */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5 mt-5 mb-5 ml-5 mr-5">
              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center">
                <DonutChartComponent data={donutChartData} />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                {radarChartData.chartData?.length > 0 ? (
                  <RadarChartComponent data={radarChartData} />
                ) : (
                  <p className="text-gray-500 text-lg font-semibold text-center">
                    No Subject Performance Data Available
                  </p>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default Adm_Analytics;