import Dep_PresidentSidebar from "../../components/depPresident/Dep_PresidentSidebar";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setExamId } from "../../redux/ExamSlice";
import Dep_PresidentNavbar from "../../components/depPresident/Dep_PresidentNavbar";

const Dep_PresidentCreateTestPage = () => {
  const [testName, setTestName] = useState("");
  const [duration, setDuration] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  let user = useSelector((state) => state.user.user);

  const handleCreateQuestions = async (e) => {
    e.preventDefault();

    if (!testName || !duration) {
      alert("Please fill in all the fields.");
      return;
    }

    // Make sure we're using the user's department from Redux state
    const payload = {
      name: testName,
      duration: parseInt(duration), // Convert to integer as backend might expect a number
    };

    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      const response = await axios.post(`${API_BASE_URL}/api/exams`, payload, {
        withCredentials: true,
      });

      const examId = response.data.newExam.exam_id;
      dispatch(setExamId(examId));
      navigate("/president/input");
    } catch (error) {
      alert("Invalid Input. Please check all fields and try again.");
      console.error(
        "Error creating test:",
        error.response?.data || error.message
      );
    }
  };

  const handleCancel = () => {
    setTestName("");
    setDuration("");
  };

  const handleGoBack = () => {
    navigate(-1);
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
    <div className="min-h-screen flex">
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Dep_PresidentSidebar />
      </div>

      <div className="flex-1 bg-gray-100">
        <Dep_PresidentNavbar />
        <div className="flex items-center">
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
          <h1 className="text-xl sm:text-2xl font-bold ml-52 xl:m-6">
            Create Aptitude Test
          </h1>
        </div>

        <div className="flex items-center mb-6 ml-5">
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 mr-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-700">
            Basic create test info.
          </h2>
        </div>

        <div className="bg-white rounded-lg shadow-md p-5 ml-5 w-[96%]">
          <form>
            <div className="mb-6">
              <label
                htmlFor="testName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Test name
              </label>
              <input
                type="text"
                id="testName"
                placeholder="Eg. Numerical reasoning test"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Duration (in minutes)
              </label>
              <input
                type="number"
                id="duration"
                placeholder="Eg. 30"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={duration === 0 ? "" : duration}
                onChange={(e) => {
                  const value =
                    e.target.value === ""
                      ? ""
                      : Math.max(0, Number(e.target.value));
                  setDuration(value);
                }}
                onBlur={() => {
                  if (duration === "") setDuration(0); 
                }}
                min="0"
                required
              />
            </div>
          </form>
        </div>

        <div className="flex items-center space-x-4 mt-20 ml-6">
          <button
            type="submit"
            className="bg-[#1349C5] text-white px-3 lg:px-4 py-2 rounded hover:bg-[#4d75d2] border-[#2c54b2] opacity-90 hover:opacity-100"
            onClick={handleCreateQuestions}
          >
            Create questions
          </button>
          <button
            type="button"
            className="bg-white text-gray-900 px-3 py-2 rounded hover:bg-gray-300 border border-gray-700 opacity-90 hover:opacity-100"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dep_PresidentCreateTestPage;
