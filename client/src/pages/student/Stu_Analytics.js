import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Stu_Sidebar from "../../components/student/Stu_Sidebar";
import Details from "../../components/NavbarDetails";
import BarChartComponent from "../../components/analytics/BarChartComponent";
import PieChartComponent from "../../components/analytics/PieChartComponent";
import LineChartComponent from "../../components/analytics/LineChartComponent";
import DisplayComponent from "../../components/analytics/DisplayComponent";
import DonutChartComponent from "../../components/analytics/DonutChartComponent";
import HorizontalBarChartComponent from "../../components/analytics/HorizontalBarChartComponent";

function Stu_Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [testCompletionData, setTestCompletionData] = useState(null);
  const [data, setData] = useState([]);
  const [avgData, setAvgData] = useState([]);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const sidebarRef = useRef(null);
  const detailsRef = useRef(null);
  const user_id = useSelector((state) => state.user.user.id);

  const fetchData = async () => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      let url = `${API_BASE_URL}/api/analysis/overall-results/${user_id}`;
      const response = await axios.get(url, { withCredentials: true });
      console.log(response.data);
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
      console.log("avg data", response.data.result);
      setAvgData(response.data.result);
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
      // if(testCompletionData){
      // accuracyCalculation()
      // }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  console.log(data);
  console.log("testData", testCompletionData);
  console.log("avgData", avgData);

  useEffect(() => {
    if (user_id) {
      fetchData();
      fetchCompletionData();
      fetchAvgData();
    }
  }, [user_id]);

  const rankData = {
    title: "Rank Progression",
    dataKey: "name",
    chartData: [
      { name: "Semester 1", rank: 5 },
      { name: "Semester 2", rank: 3 },
      { name: "Semester 3", rank: 2 },
      { name: "Semester 4", rank: 1 },
    ],
  };

  const chartData = {
    title: "Performance Over Time",
    color: "#0703fc",
    chartData: data.map((exam) => ({
      name: exam?.exam_name,
      Percentage: exam?.percentage,
    })),
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
    if(data[0]){
    console.log("categories", Object.keys(data[0]?.category).score)}
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

  const studentParticipationData = {
    title: "Student Participation",
    chartData: [
      { category: "Total Students", count: 1000 },
      { category: "Participated Students", count: 754 },
      { category: "Not Participated Students", count: 246 },
    ],
    xKey: ["count"],
    yKey: "category",
    colors: {
      count: "#1349C5",
    },
  };

  const subjectPerformanceData = {
    title: "Subject-wise Performance",
    // chartData: [
    //   { subject: "Maths", yourScore: 70, average: 80, maxMarks: 100 },
    //   { subject: "Mechanics", yourScore: 60, average: 75, maxMarks: 100 },
    //   { subject: "DSA", yourScore: 40, average: 65, maxMarks: 100 },
    // ],
    chartData: (() => {
      // Get a unique set of all subjects across all exams
      const allSubjects = [...new Set(data.flatMap(exam => Object.keys(exam.category)))];
  
      return allSubjects.map((subject) => {
        // Calculate total and average scores for this subject across all exams
        const totalScore = data.reduce((sum, exam) => sum + Number(exam.category[subject]?.score || 0), 0);
        const totalMaxScore = data.reduce((sum, exam) => sum + Number(exam.category[subject]?.max_score || 0), 0);
        const attemptedExams = data.filter(exam => subject in exam.category).length;
        const averageScore = attemptedExams > 0 ? ((totalScore / totalMaxScore)*100).toFixed(2) : 0;
  
        return {
          subject, // Subject name
          yourScore: totalScore, // Total score for this subject across exams
          average: averageScore, // Average score across exams
          maxMarks: totalMaxScore, // Total max marks possible
        };
      });
    })(),
    xKey: ["yourScore", "average", "maxMarks"],
    yKey: "subject",
    colors: {
      yourScore: "#1349C5",
      average: "#6A88F7",
      maxMarks: "#D3D3D3",
    },
  };

  return (
    <div className="min-h-screen flex ml-20">
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
        } transition-transform duration-300 w-64 xl:block`}
      >
        <Stu_Sidebar />
      </div>
      <div className="bg-gray-100 h-14 border-b border-gray-200 flex items-center">
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
                sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>
        <h1 className="text-xl font-medium text-gray-800 ml-5 sm:ml-60 xl:ml-5">
          Dashboard
        </h1>
        <div
          className="h-9 w-9 rounded-full bg-blue-300 ml-auto mr-5 flex items-center justify-center text-blue-700 text-sm hover:cursor-pointer"
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
        >
          AM
        </div>
        <div ref={detailsRef}>{isDetailsOpen && <Details />}</div>
      </div>
      <div className="grid grid-cols-3 gap-11 justify-center mt-4 mr-4 ">
        <div className="bg-white rounded-lg shadow-md max-w-xl">
          <LineChartComponent
            data={chartData}
            xAxisKey="name"
            lineDataKey="value"
            lineColor="#0703fc"
          />
        </div>
        <div className="border border-gray-600 rounded-md px-4 py-4">
          {/* <RadarChartComponent data={accuracyData} /> */}
        </div>
        <div className="border border-gray-600 rounded-md px-4 py-4">
          <BarChartComponent data={rankData} />
        </div>
        <div>
          {testCompletionData ? (
            <PieChartComponent data={testCompletionData} />
          ) : (
            <p>Loading Test Completion Data...</p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md max-w-xl">
          <LineChartComponent data={chartData} />
        </div>

        <div>
          <HorizontalBarChartComponent data={studentParticipationData} />
          <HorizontalBarChartComponent data={subjectPerformanceData} />
        </div>

        <div>
          <DonutChartComponent data={accuracyData} />
          <DisplayComponent title="Your Rank" value={25} />
          <DisplayComponent
            title="Average Score"
            value={avgData.average_score}
          />
        </div>
      </div>
    </div>
  );
}

export default Stu_Analytics;
