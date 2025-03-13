import React, { useState, useRef, useEffect } from "react";
import Adm_Navbar from "../../components/admin/Adm_Navbar";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import BarChartComponent from "../../components/analytics/BarChartComponent";
import RadarChartComponent from "../../components/analytics/RadarChartComponent";
import DonutChartComponent from "../../components/analytics/DonutChartComponent";
import MultiLineChartComponent from "../../components/analytics/MultiLineChartComponent";
import axios from "axios";
import PieChartComponent from "../../components/analytics/PieChartComponent";
import TableComponent from "../../components/analytics/TableComponent";
import DisplayComponent from "../../components/analytics/DisplayComponent";

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

  const fetchAllTpoAnalysis = async () => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      let url = `${API_BASE_URL}/api/department-analysis/all-dept-analysis/${selectedDepartment}`;
      const response = await axios.get(url, { withCredentials: true });

      setCategoryWiseData(response.data.category_performance);
      setTopPerformers(response.data.top_performer);
      setBottomPerformers(response.data.bottom_performer);
      setParticipationRate(response.data.participation_rate);
      setAccuracyData(response.data.accuracy_rate);

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // console.log(selectedDepartment);
  // console.log("avgData", avgData);
  // console.log("accuracyData", accuracyData);
  // console.log("categoryWiseData", categoryWiseData);
  // console.log("topPerformers", topPerformers);
  // console.log("bottomPerformers", bottomPerformers);
  // console.log("participationRate", participationRate);

  useEffect(() => {
    fetchAllTpoAnalysis();
  }, [selectedDepartment]);

  const handleDepartmentChange = (dept) => {
    setSelectedDepartment(dept);
  };

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

  // If filteredData is empty, use default values
  const donutChartData = {
    title: "Accuracy Rate",
    chartData:
      filteredAccuracyData.length > 0
        ? filteredAccuracyData
        : [
            { name: "Correct", value: 0, fill: "#4CAF50" },
            { name: "Wrong", value: 100, fill: "#F44336" },
          ],
  };
  const rankData = { department_rank: 2 };
  const dSup = "nd";


  const participationRateData = {
    title: "Participation Rate",
    chartData: [
      {
        name: "Participated",
        value: Number(participationRate[0]?.participation_rate) || 0,
        fill: "#1349C5",
      },
      {
        name: "Not Participated",
        value: +(Number(100 - participationRate[0]?.participation_rate).toFixed(2)) || 100, // to convert this from string to floating point
        fill: "#6F91F0",
      },
    ],
  };

  const radarChartData = {
    title: "Subject-wise Performance",
    chartData: categoryWiseData
      .filter(
        (category) =>
          category?.category != null && category?.category !== "null"
      )
      .map((category) => ({
        name: category?.category,
        yourScore: Number(category?.average_category_score),
        maxMarks: Number(category?.max_category_score) || 0,
      })),
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
        className={`fixed top-0 left-0 h-full bg-gray-100 z-50 border-r-2 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Adm_Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full bg-gray-100">
        <Adm_Navbar />

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
                d={
                  sidebarOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-800  xl:ml-7 md ">
            Analytics Dashboard
          </h1>
          <div className="flex justify-center space-x-4 mr-10">
            {departments.map((dept) => (
              <button
                key={dept}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  selectedDepartment === dept
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

        {/* Department Selection Buttons */}

        {/* Rankings & Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-5 mt-5 mb-5  ml-5 mr-5 ">
        <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-center justify-center border border-gray-200  ">
    <DisplayComponent
      title="Overall Department Rank"
      rank={rankData?.department_rank || "N/A"}
      superscript={dSup}
    />
  </div>
          <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center">
            <DonutChartComponent data={donutChartData} />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <RadarChartComponent data={radarChartData} />
          </div>
        </div>

        {/* Performers Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5 mb-5 ml-5 mr-5">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-medium text-[#1349C5] self-start">Top Performers</h2>
            <ul>
              {topPerformers.map((name, index) => (
                <li key={index} className="border-b py-2 text-gray-700">
                  {name?.department_rank}. {name?.student_name}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-medium text-[#1349C5] self-start">Bottom Performers</h2>
            <ul>
              {bottomPerformers.map((name, index) => (
                <li key={index} className="border-b py-2 text-gray-700">
                  {name?.department_rank}. {name?.student_name}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <PieChartComponent data={participationRateData} />
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default Adm_Analytics;
