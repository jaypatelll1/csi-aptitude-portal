import React, { useState, useRef, useEffect } from "react";

import { useParams } from "react-router-dom";
import axios from "axios";
import Details from "../../components/NavbarDetails";
import PieChartComponent from "../../components/analytics/PieChartComponent";
import LineChartComponent from "../../components/analytics/LineChartComponent";
import DonutChartComponent from "../../components/analytics/DonutChartComponent";
import RadarChartComponent from "../../components/analytics/RadarChartComponent";
import Dep_Sidebar from "../../components/department/Dep_Sidebar";

function Dep_StudentAnalytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [testCompletionData, setTestCompletionData] = useState(null);
  const [data, setData] = useState([]);
  const [avgData, setAvgData] = useState([]);
  const [sup, setSup] = useState("");
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [rankData, setRankData] = useState([]);
  const sidebarRef = useRef(null);
  const detailsRef = useRef(null);
  // const user_id = useSelector((state) => state.user.user.id);
    const { user_id } = useParams();

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
  
  const fetchData = async () => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      let url = `${API_BASE_URL}/api/analysis/overall-results/${user_id}`;
      const response = await axios.get(url, { withCredentials: true });
      // console.log(response.data);
      setData(response.data.results);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchAvgData = async () => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      let url = `${API_BASE_URL}/api/analysis/avg-results/${user_id}`;
      const response = await axios.get(url, { withCredentials: true });
      // console.log("avg data", response.data.result);
      setAvgData(response.data.result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchRankData = async () => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      let url = `${API_BASE_URL}/api/analysis/rank/${user_id}`;
      const response = await axios.get(url, { withCredentials: true });

      console.log("avg data", response.data.result);
      setRankData(response.data.result);
      superscript(response.data.result.rank);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchCompletionData = async () => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      let url = `${API_BASE_URL}/api/analysis/tests-completed/${user_id}`;
      const response = await axios.get(url, { withCredentials: true });

      const { attempted, total } = response.data.exams;

      setTestCompletionData({
        title: "Test Completion Rate",
        chartData: [
          { name: "Completed", value: attempted, fill: "#1349C5 " },
          { name: "Remaining", value: total - attempted, fill: "#6F91F0" },
        ],
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // console.log(data);
  // console.log("testData", testCompletionData);
  // console.log("avgData", avgData);

  useEffect(() => {
    if (user_id) {
      fetchData();
      fetchCompletionData();
      fetchAvgData();
      fetchRankData();
    }
  }, [user_id]);

  // const rankData = {
  //   title: "Rank Progression",
  //   dataKey: "name",
  //   chartData: [
  //     { name: "Semester 1", rank: 5 },
  //     { name: "Semester 2", rank: 3 },
  //     { name: "Semester 3", rank: 2 },
  //     { name: "Semester 4", rank: 1 },
  //   ],
  // };

  const chartData = {
    title: "Performance Over Time",
    color: "#0703fc",
    chartData: data.map((exam) => ({
      name: exam?.exam_name,
      Percentage: exam?.percentage,
    })),
  };

  const superscript = (rank) => {
      const condition = rank % 10;
      if (condition === 1) setSup("st");
      else if (condition === 2) setSup("nd");
      else if (condition === 3) setSup("rd");
      else setSup("th");
    
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

        const attemptedExams = validData.filter(
          (exam) => subject in exam.category
        ).length;

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
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
        } transition-transform duration-300 w-64 xl:block shadow-lg`}
      >
        <Dep_Sidebar />
      </div>

      <div className="flex flex-col flex-1">
        {/* Header */}
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
                d={
                  sidebarOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-800 ml-5">
            Dashboard
          </h1>
          <div
            className="h-9 w-9 rounded-full bg-blue-300 ml-auto flex items-center justify-center text-blue-700 text-sm hover:cursor-pointer"
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          >
            AM
          </div>
          <div ref={detailsRef}>{isDetailsOpen && <Details />}</div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-6 lg:ml-64">
          {/* Rank Display */}
          <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center justify-center border border-gray-200">
            <h2 className="text-gray-700 text-lg font-medium">Your Rank</h2>
            <span className="text-5xl font-bold text-gray-900 ">
              {rankData.rank}
              <sup className="text-xl">{sup}</sup>
            </span>
          </div>

          {/* Line Chart - Overall Score */}
          <div className="bg-white shadow-lg rounded-lg p-5 border border-gray-200 col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Overall Score
            </h3>
            <LineChartComponent
              data={chartData}
              xAxisKey="name"
              lineDataKey="value"
              lineColor="#0703fc"
            />
          </div>
          <div className="flex flex-row gap-4">
            {/* Accuracy Rate - Donut Chart */}

            <div className="bg-white shadow-lg rounded-lg p-6 px-[5vh] flex flex-col items-center border border-gray-200">
              <DonutChartComponent data={accuracyData} />
              <p className="text-2xl font-bold mt-2">
                {Math.round((correct / total) * 100)}%
              </p>
            </div>

            {/* Subject-wise Performance - Radar Chart */}
            <div className="bg-white shadow-lg rounded-lg p-6 w-[32vw] border border-gray-200">
              {subjectPerformanceData.chartData.length > 0 ? (
                <RadarChartComponent data={subjectPerformanceData} />
              ) : (
                <p className="text-center text-gray-500">No Data Available</p>
              )}
            </div>

            {/* Test Completion Rate - Pie Chart */}
            <div className="bg-white shadow-lg rounded-lg p-6 border w-[23vw] border-gray-200">
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
      </div>
    </div>
  );
}

export default Dep_StudentAnalytics;
