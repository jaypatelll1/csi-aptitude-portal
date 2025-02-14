import React, { useState, useRef, useEffect} from "react";
import Stu_Sidebar from "../../components/student/Stu_Sidebar";
import Details from "../../components/NavbarDetails";
import BarChartComponent from "../../components/analytics/BarChartComponent";
import PieChartComponent from "../../components/analytics/PieChartComponent";
import RadialChartComponent from "../../components/analytics/RadialChartComponent ";
import { useSelector } from "react-redux";
import axios from "axios"

function Stu_Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const sidebarRef = useRef(null);
  const detailsRef = useRef(null);
  const user_id = useSelector((state) => state.user.user.id);
  console.log(user_id)
  const [data, setData] = useState(null);
  
  const fetchData = async () => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      let url = `${API_BASE_URL}/api/analysis/overall-results/${user_id}`;
      
      const response = await axios.get(url, { withCredentials: true });
     
      
      setData(response.data); // Store data in state
      console.log(data)
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  useEffect(() => {
    if (user_id) {
      fetchData();
    }
  }, [user_id]); // Re-run if user_id changes
  
  

  const accuracyData = {
    title: "Accuracy Rate",
    dataKey: "accuracy",
    chartData: [
      { name: "Math", accuracy: 80, fill: "#1349C5" },
      { name: "Science", accuracy: 75, fill: "#6F91F0" },
      { name: "English", accuracy: 90, fill: "#1349C5" },
      { name: "History", accuracy: 60, fill: "#6F91F0" },
      { name: "Computer", accuracy: 95, fill: "#1349C5" },
    ],
  };
  
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
    
  const testCompletionData = {
    title: "Test Completion Rate",
    chartData: [
      { name: "Completed", value: 8, fill: "#1349C5" },
      { name: "Remaining", value: 2, fill: "#6F91F0" },
    ],
  };
  

  const attemptData = {
    title: "Attempted vs Unattempted Questions",
    chartData: [
      { name: "Attempted", value: 35, fill: "#1349C5" },  // Dark Blue
      { name: "Unattempted", value: 15, fill: "#6F91F0" }, // Lighter Blue
    ],
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
                sidebarOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
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
  
      <div className="border border-gray-600 rounded-md px-4 py-4">
       <RadialChartComponent data={accuracyData} />
       </div>
       <div className="border border-gray-600 rounded-md px-4 py-4">
       <BarChartComponent data={rankData} />
       </div>
       <div className="border border-gray-600 rounded-md px-4 py-4">
       <PieChartComponent data={testCompletionData} />
       </div>
       <div className="border border-gray-600 rounded-md px-4 py-4">
       <PieChartComponent data={attemptData} />
       </div>
       
       

       

       
    


</div>

    </div>
  );
}



export default Stu_Analytics;
