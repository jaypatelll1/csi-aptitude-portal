import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import Adm_DashboardTiles from "../../components/admin/Adm_DashboardTiles";
import Adm_DraftedTestCard from "../../components/admin/Adm_DraftedTestCard";
import Adm_ScheduledTestCard from "../../components/admin/Adm_ScheduleTestCard";
import Adm_PastTestCard from "../../components/admin/Adm_PastTestCard";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const [tileData, setTileData] = useState([]);
  const [activeTab, setActiveTab] = useState("drafted");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [testsData, setTestsData] = useState({
    drafted: [],
    scheduled: [],
    past: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const sidebarRef = useRef(null);
  // const [limit, setLimit] = useState(10); // You can set the default limit to 10 or any number
  const [totalPages, setTotalPages] = useState(1); // Total number of pages from the backend
  const [page, setPage] = useState(1);
  let limit = 15;

  const [selectedTestId, setSelectedTestId] = useState(null);


  const handleTestClick = (exam_id) => {
    setSelectedTestId(exam_id);
    // console.log('Clicked test ID:', exam_id); // Log the ID of the clicked test
  };
  const formatToReadableDate = (isoString) => {
    const date = new Date(isoString);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-IN", options);
  };


  // Fetch tests data function
  const fetchTestsData = async (endpoint, key) => {
    try {
      const response = await axios.get(endpoint,{params: { page, limit }});
      console.log('respnse ',response);
      
// console.log('response.data.totalCount ',response.data.totalCount);
const totalRecords = response.data.totalRecords;
console.log('totalRecords',totalRecords);

      setTotalPages(Math.ceil(totalRecords/ limit)); 
      console.log('total is ',totalPages);
      

      setTestsData((prevData) => ({
        ...prevData,
        [key]: response.data.exams.map((exam) => ({
          exam_id : exam.exam_id,
          end_time : exam.end_time,
          Start_time : exam.start_time,
          title: exam.exam_name || "Untitled Exam",
          questions: exam.question_count || "N/A", 
          duration: exam.duration ? `${exam.duration} min` : "N/A",
          date: formatToReadableDate(exam.created_at),
        })),
              
      }));
    } catch (err) {
      console.error(`Error fetching ${key} tests:`, err);
      setError(`Failed to fetch ${key} tests. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handleNext = () => {
    if (page < totalPages) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  useEffect(() => {
    // Close the sidebar if clicked outside
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    // Attach event listener to the document
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [studentsRes, testsRes, lastTestRes] = await Promise.all([
          axios.get("/api/stats/all-students"),
          axios.get("/api/stats/all-tests"),
          axios.get("/api/stats/last-test"),
        ]);

        const studentsCount = studentsRes.data.totalStudentsCount;
        const liveTestsCount = testsRes.data.liveTestsCount;
        const scheduledTestsCount = testsRes.data.scheduledTestsCount;
        const lastTestStudentCount = lastTestRes.data.studentCount;

        setTileData([
          { label: "Live Tests", value: liveTestsCount },
          { label: "Scheduled Tests", value: scheduledTestsCount },
          { label: "Active Students", value: studentsCount },
          { label: "Students in Last Exam", value: lastTestStudentCount },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    const fetchAllTestsData = async () => {
      setLoading(true);
      try {
        await fetchTestsData(`/api/exams/drafts`, "drafted");
        await fetchTestsData(`/api/exams/scheduled`, "scheduled");
        await fetchTestsData(`/api/exams/past`, "past");
      } catch (err) {
        console.error("Error fetching test data:", err);
        setError("Failed to load tests. Please try again.");
      }
    };

    fetchDashboardData();
    fetchAllTestsData();
  }, []);

  const createTestHandler = () => {
    navigate("/admin/createtest");
  };


  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
       
          <Adm_Sidebar testsData={testsData}/>


      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            className="xl:hidden text-gray-800"
            onClick={() => setSidebarOpen(!sidebarOpen)}
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
          <h1 className="text-2xl font-bold text-gray-700">Admin Dashboard</h1>

          <button
            onClick={createTestHandler}
            className="bg-blue-200 text-blue-900 px-4 py-2 rounded hover:bg-blue-300 border border-blue-700 opacity-90 hover:opacity-100"
          >
            + Create Test
          </button>
        </div>

        {/* Dashboard Tiles */}
        <div className="p-0 w-full flex justify-center">
          <Adm_DashboardTiles tileData={tileData} />
        </div>

        {/* Tabs and Cards */}
        <div className="p-4">
          {/* Tabs */}
          <div className="flex space-x-4 border-b pb-2">
            {["drafted", "scheduled", "past"].map((tab) => (
              <button
                key={tab}
                className={`text-lg font-semibold ${activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600"
                  }`}
                onClick={() => setActiveTab(tab)}
              >
                {`${tab.charAt(0).toUpperCase()}${tab.slice(1)} Tests`}
              </button>
            ))}
          </div>


          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              testsData[activeTab]?.map((test) => {
                // Ensure the key is unique (using test.test_id if available)
                const key = test.test_id || test.id || test.name;  // Adjust depending on your test object structure

                if (activeTab === "drafted") {
                  return (
                    <Adm_DraftedTestCard
                      key={key}
                      test={test}
                     
                    />
                  );
                } else if (activeTab === "scheduled") {
                  return (
                    <Adm_ScheduledTestCard
                      key={key}
                      test={test}
                
                    />
                  );
                } else if (activeTab === "past") {
                  return (
                    <Adm_PastTestCard
                      key={key}
                      test={test}
                     
                    />
                  );
                }
                return null;
              })
            )}

           </div> 
           <div className="flex justify-center items-center mt-5">
            <svg
              onClick={ handlePrev}
              className="cursor-pointer mr-2"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="24"
              viewBox="0 0 12 24"
              fill="none"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M1.84306 11.2884L7.50006 5.63137L8.91406 7.04537L3.96406 11.9954L8.91406 16.9454L7.50006 18.3594L1.84306 12.7024C1.65559 12.5148 1.55028 12.2605 1.55028 11.9954C1.55028 11.7302 1.65559 11.4759 1.84306 11.2884Z"
                fill="black"
              />
            </svg>
            <span>Page {page}</span>
            <svg
              onClick={  handleNext  }
              className="cursor-pointer ml-2"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="24"
              viewBox="0 0 12 24"
              fill="none"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M10.1569 11.2884L4.49994 5.63137L3.08594 7.04537L8.03594 11.9954L3.08594 16.9454L4.49994 18.3594L10.1569 12.7024C10.3444 12.5148 10.4497 12.2605 10.4497 11.9954C10.4497 11.7302 10.3444 11.4759 10.1569 11.2884Z"
                fill="black"
              />
            </svg>
          </div>

          </div>
        </div>
   
   
  
      
    </div>
  );
};

export default Dashboard;
