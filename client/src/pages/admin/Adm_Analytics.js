import React, { useState, useRef, useEffect } from "react";
import axios from "axios"; // Add this import
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
import { useSelector, useDispatch } from "react-redux";
import { setDepartmentAnalysis } from "../../redux/analysisSlice";


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
  const [error, setError] = useState(null); // State to handle errors
  const dispatch = useDispatch();
  const defaultDataTimerRef = useRef(null);
  const departmentDataTimerRef = useRef(null);

  const departmentAnalysis = useSelector(
    (state) => state.analysis.departmentAnalysis[selectedDepartment]
  ); // Fetch data from redux

  const fetchAllTpoAnalysis = async () => {
    try {
      if (departmentAnalysis) {
        setCategoryWiseData(departmentAnalysis.category_performance);
        setTopPerformers(departmentAnalysis.top_performer);
        setBottomPerformers(departmentAnalysis.bottom_performer);
        setParticipationRate(departmentAnalysis.participation_rate);
        setAccuracyData(departmentAnalysis.accuracy_rate);
        setPerformanceOverTime(departmentAnalysis.performance_over_time);

        setDeptRank(departmentAnalysis.dept_ranks);
        superscript(setDSup, departmentAnalysis.dept_ranks.department_rank);

        setStudentCount(departmentAnalysis.studentCount.student_count);

        setIsLoading(false); // Set loading to false after data is loaded
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(true);
    }
  };

  useEffect(() => {
    fetchAllTpoAnalysis();
  }, [selectedDepartment, departmentAnalysis]);

  const handleDepartmentChange = (dept) => {
    setSelectedDepartment(dept);

  };






  useEffect(() => {
    const loadDefaultData = async () => {
      try {
        setIsLoading(true);

        // Add timer to stop loader after 30 seconds
        defaultDataTimerRef.current = setTimeout(() => {
          setIsLoading(false);
          setError("Request timeout - Unable to load default data");
        }, 30000);

        let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
        const response = await axios.get(
          `${API_BASE_URL}/api/department-analysis/all-dept-analysis/CMPN`,
          { withCredentials: true }
        );

        // Clear timer on successful response
        if (defaultDataTimerRef.current) {
          clearTimeout(defaultDataTimerRef.current);
          defaultDataTimerRef.current = null;
        }

        if (!response.data || response.data.length === 0) {
          setIsLoading(false);
          setError("No data available for CMPN department");
          return;
        }

        dispatch(setDepartmentAnalysis({ department: "CMPN", data: response.data }));
        setIsLoading(false);

      } catch (err) {
        console.log(err);

        // Clear timer on error
        if (defaultDataTimerRef.current) {
          clearTimeout(defaultDataTimerRef.current);
          defaultDataTimerRef.current = null;
        }

        setIsLoading(false);
        setError("Failed to fetch CMPN department data");
      }
    };

    loadDefaultData();
  }, [dispatch]);

  // Fetch data when department changes
  useEffect(() => {
    const fetchDepartmentAnalysis = async () => {
      try {
        if (!departmentAnalysis?.[selectedDepartment] && selectedDepartment !== "CMPN") {
          setIsLoading(true);
          setError(null); // Clear any previous errors


          departmentDataTimerRef.current = setTimeout(() => {
            setIsLoading(false);
            setError(`Request timeout - Unable to fetch ${selectedDepartment} data`);
          }, 5000);

          let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
          const response = await axios.get(
            `${API_BASE_URL}/api/department-analysis/all-dept-analysis/${selectedDepartment}`,
            { withCredentials: true }
          );

          // Clear timer on successful response
          if (departmentDataTimerRef.current) {
            clearTimeout(departmentDataTimerRef.current);
            departmentDataTimerRef.current = null;
          }

          if (!response.data || response.data.length === 0) {
            setIsLoading(false);
            setError(`No data available for ${selectedDepartment} department`);
            // Clear the current department data to prevent showing wrong data
            dispatch(setDepartmentAnalysis({
              department: selectedDepartment,
              data: []
            }));
            return;
          }

          dispatch(setDepartmentAnalysis({
            department: selectedDepartment,
            data: response.data
          }));
          setIsLoading(false);
        }
      } catch (err) {
        console.log(err);

        // Clear timer on error
        if (departmentDataTimerRef.current) {
          clearTimeout(departmentDataTimerRef.current);
          departmentDataTimerRef.current = null;
        }

        setIsLoading(false);
        setError(`Failed to fetch ${selectedDepartment} department analysis`);
        // Clear the current department data on error
        dispatch(setDepartmentAnalysis({
          department: selectedDepartment,
          data: []
        }));
      }
    };

    fetchDepartmentAnalysis();
  }, [selectedDepartment, dispatch]);

  const filteredAccuracyData = [
    {
      name: "Correct",
      value: Number(accuracyData?.accuracy_rate),
      fill: "#4CAF50",
    },
    {
      name: "Wrong",
      value: 100 - Number(accuracyData?.accuracy_rate),
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

  // If filteredData is empty, use default values
  const donutChartData = {
    title: "Accuracy Rate",
    chartData:
      filteredAccuracyData?.length > 0
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
        value: Number(participationRate?.participation_rate) || 0,
        fill: "#1349C5",
      },
      {
        name: "Not Participated",
        value: +Number(100 - participationRate?.participation_rate).toFixed(2) || 100, // to convert this from string to floating point
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
        yourScore: Number(category?.average_category_score),
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
        className={`fixed top-0 left-0 h-full bg-gray-100 z-50 border-r-2 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Adm_Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full bg-gray-100">
        <Adm_Navbar />

        {/* Show "Loading..." while analytics are being fetched */}
        {isLoading ? (
          <div className="flex items-center justify-center h-screen">
            <Loader />
          </div>
        ) : (
          <>
            {/* Analytics Dashboard UI (Only show when data is loaded) */}
            <div className="flex items-center justify-between mt-8">
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

            {/* Other Analytics Components */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-5 mt-5 mb-5 ml-5 mr-5 ">
              <div>
                <div className="bg-white shadow-lg rounded-lg p-10 flex flex-col items-center border border-gray-200">
                  <DisplayComponent
                    title="Department Rank"
                    rank={deptRank?.department_rank || "Loading..."}
                    superscript={dSup}
                  />
                </div>
                <div className="bg-white shadow-lg rounded-lg p-10 flex flex-col items-center mt-4 border border-gray-200">
                  <DisplayComponent title="Total Students" rank={studentCount || "Loading..."} />
                </div>
              </div>
              <div className="bg-white shadow-lg rounded-lg p-5 border border-gray-200 flex-grow flex flex-col items-center col-span-2">
                {performanceOverTime?.length > 0 ? ( //Ensures data is not empty or null
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

            {/* Other Components */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5 mt-5 mb-5 ml-5 mr-5">
              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center">
                {accuracyData?.accuracy_rate !== undefined ? (
                  <DonutChartComponent data={donutChartData} />
                ) : (
                  <p className="text-gray-500 text-lg font-semibold">No Data Available</p>
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                {radarChartData.chartData?.length > 0 ? (
                  <RadarChartComponent data={radarChartData} />
                ) : (
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

export default Adm_Analytics;