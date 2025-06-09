import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Dep_Sidebar from "../../components/department/Dep_Sidebar";
import Dep_DashboardTiles from "../../components/department/Dep_DashboardTiles";
import Dep_DraftedTestCard from "../../components/department/Dep_DraftedTestCard";
import Dep_ScheduledTestCard from "../../components/department/Dep_ScheduleTestCard";
import Dep_PastTestCard from "../../components/department/Dep_PastTestCard";
import Dep_LiveTestCard from "../../components/department/Dep_LiveTestCard";
import Dep_Navbar from "../../components/department/Dep_Navbar";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader";
import { setDepartmentAnalysis } from "../../redux/analysisSlice";

const Dep_Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.user.user);
  const user_department = userData.department;

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [tileData, setTileData] = useState([]);
  const [activeTab, setActiveTab] = useState("live");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [testsData, setTestsData] = useState({
    drafted: [],
    scheduled: [],
    past: [],
    live: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sidebarRef = useRef(null);

  const [selectedTestId, setSelectedTestId] = useState(null);

  const handleTestClick = (exam_id) => {
    setSelectedTestId(exam_id);
  };

  const formatToReadableDate = (isoString) => {
    const date = new Date(isoString);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-IN", options);
  };

  // Fetch tests data function
  const fetchTestsData = async (endpoint, key) => {
    try {
      const response = await axios.get(endpoint, {
        params: {
          role: "Department",
          branch: user_department,
        },
        withCredentials: true,
      });

      setTestsData((prevData) => ({
        ...prevData,
        [key]: response.data.exams
          .filter((exam) => {
            let targetBranches = exam.target_branches;

            if (!targetBranches || targetBranches.includes("All")) {
              return true; // Show if target_branches is undefined or includes "All"
            }

            // Convert "{CMPN,INFT,EXTC,ELEC,ECS}" -> ["CMPN", "INFT", "EXTC", "ELEC", "ECS"]
            targetBranches = targetBranches
              .replace(/[{}]/g, "")
              .split(",")
              .map((branch) => branch.trim());

            return targetBranches.includes(userData.department); // Check if the user's department is included
          })
          .map((exam) => ({
            exam_id: exam.exam_id,
            end_time: exam.end_time,
            Start_time: exam.start_time,
            title: exam.exam_name || "Untitled Exam",
            questions: exam.question_count || "N/A",
            duration: exam.duration ? `${exam.duration} min` : "N/A",
            date: formatToReadableDate(exam.created_at),
            target_years: exam.target_years || "N/A",
            target_branches: exam.target_branches || "N/A",
          })),
      }));
    } catch (err) {
      console.error(`Error fetching ${key} tests:`, err);
      setError(`Failed to fetch ${key} tests. Please try again later.`);
    }
    // Don't set loading to false here - we'll manage it after all tabs have loaded
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
        const [studentsRes, testsRes, lastTestRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/stats/all-students?exam_for=Student`, {
            withCredentials: true,
          }),
          axios.get(`${API_BASE_URL}/api/stats/all-tests?exam_for=Student`, {
            withCredentials: true,
          }),
          axios.get(`${API_BASE_URL}/api/stats/last-test?exam_for=Student`, {
            withCredentials: true,
          }),
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
        const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
        // Use Promise.all to fetch all data concurrently
        await Promise.all([
          fetchTestsData(`${API_BASE_URL}/api/exams/drafts`, "drafted"),
          fetchTestsData(`${API_BASE_URL}/api/exams/scheduled`, "scheduled"),
          fetchTestsData(`${API_BASE_URL}/api/exams/past`, "past"),
          fetchTestsData(`${API_BASE_URL}/api/exams/live`, "live"),
        ]);
      } catch (err) {
        console.error("Error fetching test data:", err);
        setError("Failed to load tests. Please try again.");
      } finally {
        // Set loading to false after all data has been fetched
        setLoading(false);
      }
    };

    fetchDashboardData();
    fetchAllTestsData();
  }, [user_department]);

  const createTestHandler = () => {
    navigate("/department/createtest");
  };

  useEffect(() => {
    const fetchDepartmentAnalysis = async () => {
      try {
        let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
        let response = await axios.get(
          `${API_BASE_URL}/api/department-analysis/all-dept-analysis/${user_department}`,
          { withCredentials: true },
        );
        dispatch(
          setDepartmentAnalysis({
            department: user_department,
            data: response.data,
          }),
        );
      } catch (err) {
        console.log(err);
      }
    };
    fetchDepartmentAnalysis();
  }, [dispatch, user_department]);

  const openDetails = () => setIsDetailsOpen(true);
  const closeDetails = () => setIsDetailsOpen(false);

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

  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(
    (testsData[activeTab]?.length || 0) / ITEMS_PER_PAGE,
  );
  const paginatedData = testsData[activeTab]?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Reset current page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  return (
    <div className="min-h-screen flex">
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-100 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Dep_Sidebar testsData={testsData} />
      </div>

      <div className="flex-1 bg-gray-100">
        <Dep_Navbar setSidebarOpen={setSidebarOpen} />

        <div className="flex items-center justify-between mt-5">
          <button className="xl:hidden text-gray-800" onClick={() => setSidebarOpen(!sidebarOpen)}>
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
          <h1 className="text-2xl font-bold text-gray-700 ml-5">Department Dashboard</h1>

          <button
            onClick={createTestHandler}
            className="bg-[#1349C5] text-white px-4 py-2 rounded hover:bg-blue-300 hover:text-black border border-blue-700 opacity-90 hover:opacity-100 mr-4"
          >
            + Create Test
          </button>
        </div>

        <div className="p-0 w-full flex justify-center">
          <Dep_DashboardTiles tileData={tileData} />
        </div>

        <div className="p-4 w-[97%] xl:w-[98%] mt-8 ml-4 rounded-xl bg-white">
          <div className="flex space-x-4 border-b pb-2">
            {["live", "drafted", "scheduled", "past"].map((tab) => (
              <button
                key={tab}
                className={`text-lg font-semibold ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {`${tab.charAt(0).toUpperCase()}${tab.slice(1)} Tests`}
              </button>
            ))}
          </div>

          <div className="relative min-h-[150px] grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {loading ? (
              <div className="absolute inset-0 flex justify-center items-center col-span-full">
                <Loader />
              </div>
            ) : error ? (
              <p className="col-span-full text-center">{error}</p>
            ) : paginatedData && paginatedData.length > 0 ? (
              paginatedData.map((test) => {
                const key = test.exam_id || test.id || test.name;

                if (activeTab === "live") {
                  return <Dep_LiveTestCard key={key} test={test} />;
                } else if (activeTab === "scheduled") {
                  return <Dep_ScheduledTestCard key={key} test={test} />;
                } else if (activeTab === "past") {
                  return <Dep_PastTestCard key={key} test={test} />;
                } else if (activeTab === "drafted") {
                  return <Dep_DraftedTestCard key={key} test={test} />;
                }
                return null;
              })
            ) : (
              <p className="col-span-full text-gray-500 text-center">
                No tests available.
              </p>
            )}
          </div>

          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                className={`p-2 mx-1 rounded ${
                  currentPage === 1
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-200"
                }`}
                disabled={currentPage === 1}
              >
                &lt; {/* Left Arrow */}
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 mx-1 rounded ${
                    currentPage === i + 1
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className={`p-2 mx-1 rounded ${
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-200"
                }`}
                disabled={currentPage === totalPages}
              >
                &gt; {/* Right Arrow */}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dep_Dashboard;
