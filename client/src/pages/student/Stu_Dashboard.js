import React, { useState, useRef, useEffect } from "react";
import Stu_Sidebar from "../../components/student/Stu_Sidebar";
import StuTestCard from "../../components/student/Stu_TestCard";
import StuPastTestCard from "../../components/student/Stu_PastTestCard";
import Stu_PastCard from "../../components/student/Stu_PastCard";
import Details from "../../components/NavbarDetails";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setExam, clearExamId } from "../../redux/ExamSlice";
import { clearUser } from "../../redux/userSlice";
import { clearQuestions } from "../../redux/questionSlice";
import Loader from "../../components/Loader";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

function Stu_Dashboard() {
  const userData = useSelector((state) => state.user.user);
  let examId = useSelector((state) => state.exam.examId);

  const [tests, setTests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("ALL");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(new Date());

  // Enhanced date picker states
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [result, setResult] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]); // New state for analytics data
  const detailsRef = useRef(null);
  const calendarRef = useRef(null); // Separate ref for calendar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true); // Separate loading state for analytics
  const [error, setError] = useState(null);
  const [analyticsError, setAnalyticsError] = useState(null); // Separate error state for analytics
  const sidebarRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Helper function to format date to readable format
  const formatToReadableDate = (isoString) => {
    const date = new Date(isoString);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-IN", options);
  };

  // Function to format date to dd/MM/yyyy format
  const formatToDateString = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Function to filter tests by date range
  const filterByDateRange = (testsToFilter, start, end) => {
    if (!start || !end) return testsToFilter;

    return testsToFilter.filter(test => {
      const testDate = new Date(test.Date);
      return testDate >= start && testDate <= end;
    });
  };

  // New function to fetch analytics data
  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      const response = await axios.get(
        `${API_BASE_URL}/api/exams/results/testAnalysis/student/${userData.id}`,
        {
          withCredentials: true,
        }
      );
      
      setAnalyticsData(response.data.results );
      console.log("Analytics Data:", response.data.results);
      setAnalyticsLoading(false);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setAnalyticsError("Failed to fetch analytics data. Please try again later.");
      setAnalyticsLoading(false);
    }
  };

  // New useEffect to handle sorting, filtering, and remove duplicates
  useEffect(() => {
    if (filter === "past" && result.length > 0) {
      // Group by exam_id and keep only the latest attempt
      const uniqueTestsMap = new Map();

      result.forEach(test => {
        const existingTest = uniqueTestsMap.get(test.exam_id);
        if (!existingTest || new Date(test.Date) > new Date(existingTest.Date)) {
          uniqueTestsMap.set(test.exam_id, test);
        }
      });

      let uniqueTests = Array.from(uniqueTestsMap.values());

      // Apply date filtering
      if (startDate) {
        uniqueTests = uniqueTests.filter(test => {
          const testDate = new Date(test.Date);
          const filterDate = new Date(startDate);
          // Set time to start of day for proper comparison
          testDate.setHours(0, 0, 0, 0);
          filterDate.setHours(0, 0, 0, 0);
          return testDate >= filterDate;
        });
      }

      // Apply sorting
      let sortedTests;
      if (sort === "ALL") {
        sortedTests = uniqueTests;
      } else if (sort === "ATTEMPTED") {
        sortedTests = uniqueTests.filter(test =>
          test.isAttempted === true ||
          test.status === "finished" ||
          test.status === "completed" ||
          test.status === "submitted"
        );
      } else if (sort === "NOT ATTEMPTED") {
        sortedTests = uniqueTests.filter(test =>
          test.isAttempted === false ||
          test.status === "not_attempted" ||
          test.status === "pending" ||
          (!test.isAttempted && test.status !== "finished" && test.status !== "completed" && test.status !== "submitted")
        );
      }

      // Sort by date (older to newer) only when date filter is applied
      let finalSortedTests = sortedTests;
      if (startDate) {
        finalSortedTests = [...sortedTests].sort((a, b) => new Date(a.Date) - new Date(b.Date));
      }

      setTests(finalSortedTests);
    }
  }, [sort, result, filter, startDate, endDate]);

  // Separate useEffect for analytics section date filtering
  const [filteredAnalytics, setFilteredAnalytics] = useState([]);

  const fetchTests = async (filterType) => {
    setLoading(true);

    let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
    let payload;

    if (filterType === "all") {
      let url = `${API_BASE_URL}/api/exams/student`;
      payload = {
        status: "live",
        target_branches: [userData.department],
        target_years: [userData.year],
      };
      try {
        const response = await axios.get(url, {
          params: {
            status: payload.status,
            target_branches: payload.target_branches,
            target_years: payload.target_years,
          },
          withCredentials: true,
        });
        dispatch(setExam(response.data.exams));
        setTests(response.data.exams || []);

      } catch (error) {
        console.error("error getting response ", err);
        setError(`Failed to fetch tests. Please try again later.`);
      }
    } else if (filterType === "past") {
      payload = {
        status: "past",
        target_branches: [userData.department],
        target_years: [userData.year],
      };
      try {
        let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
        const response = await axios.get(
          `${API_BASE_URL}/api/exams/results/student/${userData.id}`,
          {
            withCredentials: true,
          }
        );
        dispatch(setExam(response.data.results));
        setResult(response.data.results || []);

      } catch (error) {
        console.error("error getting response ", err);
        setError(`Failed to fetch tests. Please try again later.`);
      }
    }

    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      const pastPaper = await axios.get(
        `${API_BASE_URL}/api/exams/results/student/${userData.id}`,
        {
          withCredentials: true,
        }
      );

      const responseExamId = await axios.get(
        `${API_BASE_URL}/api/exams/responses/user_id?status=submitted`,
        { withCredentials: true }
      );

      setResult(pastPaper.data.results);
      setLoading(false);
    } catch (err) {
      console.error("error getting response ", err);
      setError(`Failed to fetch tests. Please try again later.`);
    }
  };

  // Fixed click outside handler with separate handling for sidebar, details, and calendar
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle sidebar
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Separate effect for details and calendar click outside handling
  useEffect(() => {
    function handleClickOutside(event) {
      // Handle Details component
      if (detailsRef.current && !detailsRef.current.contains(event.target)) {
        closeDetails();
      }
      
      // Handle Calendar component separately
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchTests(filter);
  }, [filter]);

  // Fetch analytics data on component mount
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const openDetails = () => setIsDetailsOpen(true);
  const closeDetails = () => setIsDetailsOpen(false);

  const handleOnline = async () => {
    try {
      alert("You are online!");
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      const response = await axios.post(`${API_BASE_URL}/api/users/logout`, {
        withCredentials: true,
      });
      dispatch(clearUser());
      dispatch(clearExamId(examId));
      dispatch(clearQuestions());

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error handling online event:", error);
    }
  };

  useEffect(() => {
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    // Reset date filters when switching between live and past
    if (e.target.value === "all") {
      setStartDate(null);
      setEndDate(new Date());
    }
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  const getInitials = (name) => {
    if (!name) return "";
    const nameParts = name.trim().split(" ");
    const firstInitial = nameParts[0]?.charAt(0) || "";
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0) : "";
    return (firstInitial + lastInitial).toUpperCase();
  };

  // Fixed date change handler with proper event handling
  const handleDateChange = (date) => {
    setStartDate(date);
    setIsCalendarOpen(false);
  };

  // Handle date range reset
  const handleDateReset = (e) => {
    e.stopPropagation();
    setStartDate(null);
    setEndDate(new Date());
    setIsCalendarOpen(false);
  };

  // Fixed calendar toggle handler
  const handleCalendarToggle = (e) => {
    e.stopPropagation();
    setIsCalendarOpen(!isCalendarOpen);
  };

  return (
    <div className={`flex h-screen`}>
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
        } transition-transform duration-300 w-64 xl:block`}
      >
        <Stu_Sidebar />
      </div>

      {/* Main Section */}
      <div
        id="main-section"
        className={`bg-white h-max w-full overflow-hidden transition-all duration-300 xl:ml-64`}
      >
        {/* Top Bar */}
        <div className="bg-gray-100 h-14 border-b border-gray-200 flex items-center">
          {/* Burger Icon Button */}
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
                    ? "M6 18L18 6M6 6l12 12" // Cross icon for "close"
                    : "M4 6h16M4 12h16M4 18h16" // Burger icon for "open"
                }
              />
            </svg>
          </button>
          <h1 className="text-xl font-medium text-gray-800 ml-5 sm:ml-60 xl:ml-5">Dashboard</h1>
          <div
            className="h-9 w-9 rounded-full bg-blue-300 ml-auto mr-5 flex items-center justify-center text-blue-700 text-sm hover:cursor-pointer"
            onClick={openDetails}
          >
            {getInitials(userData.name)}
          </div>
          <div ref={detailsRef}>{isDetailsOpen && <Details />}</div>
        </div>

        {/* Main Content */}
        <div className="px-4">
          <h1 className="text-blue-700 text-2xl mt-4 font-medium">
            Welcome to Atharva college Aptitude Portal
          </h1>

          {/* Filters Section */}
          <div className="flex border-b border-gray-200 justify-between pb-3 items-center mt-5">
            <div>
              <select
                className="bg-white px-3 py-1 focus:outline-none font-medium text-black hover:cursor-pointer"
                value={filter}
                onChange={handleFilterChange}
              >
                <option value="all">Live</option>
                <option value="past">Past</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              {filter === "past" && (
                <>
                  <select
                    className="bg-white px-3 py-1 focus:outline-none font-medium text-black hover:cursor-pointer"
                    value={sort}
                    onChange={handleSortChange}
                  >
                    <option value="ALL">All</option>
                    <option value="ATTEMPTED">Attempted</option>
                    <option value="NOT ATTEMPTED">Not Attempted</option>
                  </select>

                  {/* Fixed Date Range Filters */}
                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-3xl border relative">
                    <button
                      onClick={handleCalendarToggle}
                      className="bg-white border border-gray-300 rounded-2xl px-3 py-1 text-sm focus:outline-none hover:bg-gray-50 cursor-pointer"
                    >
                      {startDate ? formatToDateString(startDate) : 'Select Date'}
                    </button>

                    {isCalendarOpen && (
                      <div 
                        ref={calendarRef}
                        className="absolute z-50 bg-white border border-gray-300 rounded shadow-lg p-3 mt-8 top-full right-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DatePicker
                          selected={startDate}
                          onChange={handleDateChange}
                          maxDate={new Date()}
                          className="w-full px-3 py-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          dateFormat="dd/MM/yyyy"
                          dropdownMode="select"
                          inline
                        />
                      </div>
                    )}
                    
                    <button
                      onClick={handleDateReset}
                      className="bg-red-500 rounded-3xl text-white px-3 py-1 text-sm hover:bg-red-600 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Date Range Display */}
          {filter === "past" && startDate && (
            <div className="mt-2 text-sm text-gray-600">
              Showing tests from {formatToDateString(startDate)} onwards
            </div>
          )}

          {/* Test Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 mt-5">
            {loading ? (
              <div className="absolute inset-0 flex justify-center items-center col-span-full">
                <Loader />
              </div>
            ) : error ? (
              <p className="col-span-full text-center">{error}</p>
            ) : tests.length > 0 ? (
              filter === "all" ? (
                tests.map((test, index) => (
                  <StuTestCard
                    key={test.exam_id || index}
                    examId={test.exam_id}
                    testName={test.exam_name}
                    duration={test.duration}
                    status={test.status}
                    questionCount={test.total_questions}
                    lastDate={formatToReadableDate(test.created_at)}
                  />
                ))
              ) : (
                tests.map((test, index) => (
                  <Stu_PastCard
                    key={test.exam_id || index}
                    test={{
                      exam_id: test.exam_id,
                      title: test.exam_name,
                      duration: test.duration,
                      questions: test.total_questions,
                      date: formatToReadableDate(test.Date),
                      isAttempted: test.isAttempted,
                      status: test.status,
                    }}
                  />
                ))
              )
            ) : (
              <p className="col-span-full text-center text-gray-500">
                {filter === "past" && startDate
                  ? "No exams found in the selected date range."
                  : "No exams available."
                }
              </p>
            )}
          </div>

          {/* Analytics Section */}
          <div className="mt-5 mb-8">
            <h1 className="font-semibold text-black text-lg">Analytics</h1>
            <div className="flex overflow-x-auto space-x-4 mt-3" style={{ scrollbarWidth: "none" }}>
              {analyticsLoading ? (
                <div className="flex justify-center items-center w-full">
                  <Loader />
                </div>
              ) : analyticsError ? (
                <p className="text-center text-red-500">{analyticsError}</p>
              ) : analyticsData.length > 0 ? (
                analyticsData.map((test, index) => (
                  <div className="flex-shrink-0" key={index}>
                    <StuPastTestCard
                      testName={test.exam_name}
                      submittedOn={test.Date}
                      time={test.duration}
                      total_score={test.total_score}
                      max_score={test.max_score}
                      status={test.status}
                    />
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No analytics data available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stu_Dashboard;