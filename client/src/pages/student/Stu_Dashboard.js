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

function Stu_Dashboard() {
  const userData = useSelector((state) => state.user.user);
  let examId = useSelector((state) => state.exam.examId);

  const [tests, setTests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [result, setResult] = useState([]);
  const detailsRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for toggling sidebar
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null);
  const sidebarRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Helper function to format date to readable format
  const formatToReadableDate = (isoString) => {
    const date = new Date(isoString);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-IN", options);
  };
  
  const fetchTests = async (filterType) => {
    setLoading(true);

    let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
    let payload;
    let url = `${API_BASE_URL}/api/exams/student`; // Default for "All"
    if (filterType === "all") {
      payload = {
        status: "live",
        target_branches: [userData.department],
        target_years: [userData.year],
      };
    } else if (filterType === "past") {
      payload = {
        status: "past",
        target_branches: [userData.department],
        target_years: [userData.year],
      };
    }

    try {
      const response = await axios.get(url, {
        params: {
          status: payload.status,
          target_branches: payload.target_branches,
          target_years: payload.target_years
        },
        withCredentials: true, // Make sure the cookie is sent with the request
      });
      
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      const pastPaper = await axios.get(
        `${API_BASE_URL}/api/exams/results/student/${userData.id}`,
        {
          withCredentials: true, // Make sure the cookie is sent with the request
        }
      );

      const responseExamId = await axios.get(
        `${API_BASE_URL}/api/exams/responses/user_id?status=submitted`,
        { withCredentials: true }
      );

      dispatch(setExam(response.data.exams));
      console.log('past tests is ', pastPaper);
      setResult(pastPaper.data.results);
      setTests(response.data.exams || []);

      setLoading(false); 
    } catch (err) {
      console.error("error getting response ", err);
      setError(`Failed to fetch tests. Please try again later.`);
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
    fetchTests(filter);
  }, [filter]);

  const openDetails = () => setIsDetailsOpen(true);
  const closeDetails = () => setIsDetailsOpen(false);

  useEffect(() => {
    // Close the Details component when clicking outside
    function handleClickOutside(event) {
      if (detailsRef.current && !detailsRef.current.contains(event.target)) {
        closeDetails();
      }
    }

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Cleanup the listener
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOnline = async () => {
    try {
      alert("You are online!");
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      const response = await axios.post(
        `${API_BASE_URL}/api/users/logout`,
        {
          withCredentials: true, // Make sure the cookie is sent with the request
        }
      );
      dispatch(clearUser());
      dispatch(clearExamId(examId));
      dispatch(clearQuestions());

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error handling online event:", error); // Log any potential errors
    }
  };

  useEffect(() => {
    // Add the 'online' event listener when the component mounts
    window.addEventListener('online', handleOnline);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleFilterChange = (e) => {
    setFilter(e.target.value); // Update filter
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
          <h1 className="text-xl font-medium text-gray-800 ml-5 sm:ml-60 xl:ml-5">
            Dashboard
          </h1>
          <div
            className="h-9 w-9 rounded-full bg-blue-300 ml-auto mr-5 flex items-center justify-center text-blue-700 text-sm hover:cursor-pointer"
            onClick={openDetails}
          >
            AM
          </div>
          <div ref={detailsRef}>{isDetailsOpen && <Details />}</div>
        </div>

        {/* Main Content */}
        <div className="px-4">
          <h1 className="text-blue-700 text-2xl mt-4 font-medium">
            Welcome to Atharva college Aptitude Portal
          </h1>

          {/* Filters Section */}
          <div className="flex border-b border-gray-200 pb-3 items-center mt-5">
            <select
              className="bg-white px-3 py-1 focus:outline-none font-medium text-black hover:cursor-pointer"
              value={filter}
              onChange={handleFilterChange}
            >
              <option value="all">Live</option>
              <option value="past">Past</option>
            </select>
          </div>

          {/* Test Cards - Using ternary to switch between components */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 mt-5">
          {loading ? (
              <div className="absolute inset-0 flex justify-center items-center col-span-full">
                <Loader />
              </div>
            ) : error ? (
              <p className="col-span-full text-center">{error}</p>
            ) : tests.length > 0 ? (
              filter === "all" ? (
                // Show StuTestCard for "all" (live) tests
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
                // Show Stu_PastCard for "past" tests
                tests.map((test, index) => (
                  <Stu_PastCard
                    key={test.exam_id || index}
                    test={{
                      exam_id: test.exam_id,
                      title: test.exam_name,
                      duration: test.duration,
                      questions: test.total_questions,
                      date: formatToReadableDate(test.created_at)
                    }}
                  />
                ))
              )
            ) : (
              <p>No exams available.</p>
            )}
          </div>

          {/* Analytics Section */}
          <div className="mt-5">
            <h1 className="font-semibold text-black text-lg">Analytics</h1>
            <div
              className="flex overflow-x-auto space-x-4 mt-3"
              style={{ scrollbarWidth: "none" }}
            >
              {loading ? (
              <div className="absolute inset-0 flex justify-center items-center col-span-full">
                <Loader />
              </div>
            ) : error ? (
              <p className="col-span-full text-center">{error}</p>
            ) : result.map((test, index) => (
                <div className="flex-shrink-0 " key={index}>
                  <StuPastTestCard
                    testName={test.exam_name}
                    submittedOn={test.Date}
                    time={test.duration}
                    total_score={test.total_score}
                    max_score={test.max_score}
                    status={test.status}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stu_Dashboard;