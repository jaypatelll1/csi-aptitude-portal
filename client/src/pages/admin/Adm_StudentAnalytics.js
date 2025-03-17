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

function Adm_StudentAnalytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [testCompletionData, setTestCompletionData] = useState(null);
  const [data, setData] = useState([]);
  const [avgData, setAvgData] = useState([]);
  const [performanceOverTime, setPerformanceOverTime] = useState([]);
  const [dSup, setDSup] = useState(""); // superscript of department rank
  const [oSup, setOSup] = useState(""); // superscript of overall rank
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [rankData, setRankData] = useState([]);
  const [loading, setLoading] = useState(true);
  const sidebarRef = useRef(null);
  const detailsRef = useRef(null);
  // const user_id = useSelector((state) => state.user.user.id);
  // const { user_id } = useParams();

  const location = useLocation();
  const user_id = location.state?.user_id;

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

  const fetchAllData = async () => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      let url = `${API_BASE_URL}/api/analysis/all-analysis`;
      const response = await axios.get(url, {
        withCredentials: true,
        headers: {
          "x-user-id": user_id,
        },
      });
  
      setData(response.data.overall_resultS);
      setAvgData(response.data.avg_results);
      setRankData(response.data.rank);
  
      if (response.data.rank) {
        superscript(setDSup, response.data.rank.department_rank); // set dept rank superscript
        superscript(setOSup, response.data.rank.overall_rank); // set overall rank superscript
      }
  
      setPerformanceOverTime(response.data.performance_over_time);
  
      const { attempted, total } = response.data.test_completion_data;
      setTestCompletionData({
        title: "Test Completion Rate",
        chartData: [
          { name: "Completed", value: attempted, fill: "#1349C5 " },
          { name: "Remaining", value: total - attempted, fill: "#6F91F0" },
        ],
      });
  
      // **Add this line to stop loading**
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  

  useEffect(() => {
    if (user_id) {
      fetchAllData();
    }
  }, [user_id]);

  const performanceOverTimeData = {
    title: "Performance Over Time",
    color: "#0703fc",
    chartData: performanceOverTime.map((exam) => ({
      name: exam?.created_on,
      Average: exam?.average_score,
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
    setCorrect(0);
    setTotal(0);

    data.map((exam) => {
      setCorrect((prev) => prev + exam.total_score);
    });

    data.map((exam) => {
      setTotal((prev) => prev + exam.max_score);
    });
    if (data[0]) {
      // console.log("categories", Object.keys(data[0]?.category).score);
    }
  }, [data]);

  const accuracyData = {
    title: "Accuracy Rate",
    chartData: [
      {
        name: "Correct",
        value: Math.round((correct / total) * 100),
        fill: "#28A745",
      },
      {
        name: "Wrong",
        value: Math.round(((total - correct) / total) * 100),
        fill: "#DC3545",
      },
    ],
  };

  const subjectPerformanceData = {
    title: "Topic-wise Performance",

    chartData: (() => {
      // Filter out exams with null/undefined category
      const validData = data.filter(
        (exam) => exam.category !== null && exam.category !== undefined
      );

      // Get a unique set of all subjects across valid exams, ignoring "null" key
      const allSubjects = [
        ...new Set(
          validData.flatMap((exam) =>
            Object.keys(exam.category).filter((subject) => subject !== "null")
          )
        ),
      ];

      return allSubjects.map((subject) => {
        // Calculate total and average scores for this subject across valid exams
        const totalScore = validData.reduce(
          (sum, exam) => sum + (parseFloat(exam.category[subject]?.score) || 0),
          0
        );
        const totalMaxScore = validData.reduce(
          (sum, exam) =>
            sum + (parseFloat(exam.category[subject]?.max_score) || 0),
          0
        );

        const averageScore =
          totalMaxScore > 0
            ? parseFloat(((totalScore / totalMaxScore) * 100).toFixed(2))
            : 0;

        return {
          name: subject, // Renamed from "subject" to "name" for RadarChart
          yourScore: totalScore, // Total score for this subject across exams
          average: averageScore, // Converted back to number
          maxMarks: totalMaxScore, // Total max marks possible
        };
      });
    })(),

    colors: {
      yourScore: "#1349C5",
      average: "#6A88F7",
      maxMarks: "#D3D3D3",
    },
  };

  return (
    <div className="min-h-screen flex bg-gray-100 mb-4 overflow-x-hidden">
      {/* Sidebar stays visible at all times */}
      <div ref={sidebarRef} className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"} transition-transform duration-300 w-64 xl:block shadow-lg`}>
        <Adm_Sidebar />
      </div>
  
      {/* Main Content */}
      <div className="flex flex-col flex-1 xl:ml-64">
        <div className="bg-white h-14 border-b border-gray-200 flex items-center px-6 shadow-sm">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="xl:hidden text-gray-800 focus:outline-none">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
  
          <div className="h-9 w-9 rounded-full bg-blue-300 ml-auto flex items-center justify-center text-blue-700 text-sm hover:cursor-pointer" onClick={() => setIsDetailsOpen(!isDetailsOpen)}>
            AM
          </div>
          <div ref={detailsRef}>{isDetailsOpen && <Details />}</div>
        </div>
  
        {/* Show loading state before rendering analytics */}
        {loading ? (
  <div className="flex items-center justify-center h-screen">
    <Loader />
  </div>
) : (

          <>
            <h1 className="text-3xl font-bold text-gray-800 mt-5 ml-5">Analytics</h1>
  
            {/* Analytics Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-6 mt-6">
            {!loading && (
  <div>
    <div className="bg-white shadow-lg rounded-lg p-10 flex flex-col items-center ml-4 border border-gray-200">
      <DisplayComponent title="Department Rank" rank={rankData?.department_rank} superscript={dSup} />
    </div>
    <div className="bg-white shadow-lg rounded-lg p-10 flex flex-col items-center ml-4 mt-4 border border-gray-200">
      <DisplayComponent title="Overall Rank" rank={rankData?.overall_rank} superscript={oSup} />
    </div>
  </div>
)}
  
              <div className="bg-white shadow-lg rounded-lg p-5 border border-gray-200 mr-4 col-span-2 flex flex-col items-center">
                <div className="w-full">
                  <LineChartComponent data={performanceOverTimeData} xAxisKey="name" lineDataKey="value" lineColor="#0703fc" />
                </div>
              </div>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-6 mt-6 mb-8">
              <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col ml-4 items-center border border-gray-200 col-span-2">
                <DonutChartComponent data={accuracyData} />
              </div>
  
              <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 flex items-center justify-center col-span-3">
                {subjectPerformanceData.chartData.length > 0 ? <RadarChartComponent data={subjectPerformanceData} /> : <p className="text-center text-gray-500">No Data Available</p>}
              </div>
  
              <div className="bg-white shadow-lg rounded-lg p-6 border mr-4 border-gray-200 flex items-center justify-center col-span-2">
                {testCompletionData ? <PieChartComponent data={testCompletionData} /> : <p className="text-center text-gray-500">Loading Test Completion Data...</p>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
  

}

export default Adm_StudentAnalytics;
