import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setExamId } from "../../redux/ExamSlice"; // Import the action

const CreateTestPage = () => {
  const [testName, setTestName] = useState("");
  const [duration, setduration] = useState("");
  
  const [branch, setBranch] = useState([""]);
  const [year, setYear] = useState([""]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for toggling sidebar
  const sidebarRef = useRef(null);
  const navigate = useNavigate();


  const dispatch = useDispatch();

  const handleCreateQuestions = async (e) => {
    e.preventDefault(); // Prevent default form submission


    // Create the payload to send to the server
    const payload = {
      name: `${testName}`, // The test name
      duration: `${duration}`, // Using duration as duration
target_years:`${year}`,
        target_branches: `${branch}`,
    };

    console.log('year is ',year);
    console.log("branch is ",branch)
    console.log("branch is ",payload)
    

    try {
      // Send a POST request to the server to create the test
      const response = await axios.post("/api/exams", payload);
      console.log("exam id is ", response.data.newExam.exam_id);
      const examId = response.data.newExam.exam_id;

      dispatch(setExamId(examId));
      // Log success response and navigate to the input page
      console.log("Test created successfully:", response.data);
      navigate("/admin/input"); // Navigate to the input page after success
    } catch (error) {
      // Log error response if something goes wrong
      console.error(
        "Error creating test:",
        error.response?.data || error.message
      );
    }
  };

  const handleCancel = () => {
    setTestName("");
    setduration("");
  };

  const handleGoBack = () => {
    navigate(-1);
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

  return (
    <div className="min-h-screen flex">
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Adm_Sidebar />
      </div>

      <div className="flex-1 p-4 sm:p-6">
        <div className="flex items-center  mb-4 sm:mb-6">
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
          <h1 className="text-xl sm:text-2xl font-bold ml-52 xl:m-0">
            Create Aptitude Test
          </h1>
        </div>

        <div className="flex items-center mb-6">
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

        <div className="bg-white rounded-lg shadow-md p-6">
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
                Duration
              </label>
              <input
                type="number"
                id="duration"
                placeholder="Eg. 30"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={duration}
                onChange={(e) => setduration(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="Branch"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Branch
              </label>
              <input
                type="text"
                id="testName"
                placeholder="Eg. CMPN, INFT, EXTC,ELEC, ECS"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="Year"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Year
              </label>
              <input
                type="text"
                id="testName"
                placeholder="Eg. FE, SE, TE, BE"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </div>

          </form>
        </div>

        <div className="flex items-center space-x-4 mt-20">
          <button
            type="submit"
            className="bg-green-200 text-green-900 px-3 lg:px-4 py-2 rounded hover:bg-green-300 border border-green-700 opacity-90 hover:opacity-100"
            onClick={handleCreateQuestions}
          >
            Create questions
          </button>
          <button
            type="button"
            className="bg-gray-200 text-gray-900 px-3 py-2 rounded hover:bg-gray-300 border border-gray-700 opacity-90 hover:opacity-100"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTestPage;
