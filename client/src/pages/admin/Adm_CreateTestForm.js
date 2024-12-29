import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setExamId } from '../../redux/ExamSlice';  // Import the action

const CreateTestPage = () => {
  const [testName, setTestName] = useState("");
  const [duration, setduration] = useState("");
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const handleCreateQuestions = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Create the payload to send to the server
    const payload = {
      "name" : `${testName}`, // The test name
      "duration":`${duration}`, // Using duration as duration
    };

    try {
      // Send a POST request to the server to create the test
      const response = await axios.post("/api/exams", payload);
      console.log('exam id is ', response.data.newExam.exam_id);
      const examId = response.data.newExam.exam_id; 
      
      dispatch(setExamId(examId));
      // Log success response and navigate to the input page
      console.log("Test created successfully:", response.data);
      navigate("/admin/input"); // Navigate to the input page after success
    } catch (error) {
      // Log error response if something goes wrong
      console.error("Error creating test:", error.response?.data || error.message);
    }
  };
  
  const handleCancel = () => {
    setTestName("");
    setduration("");
  };

  const handleGoBack = () => {
    navigate(-1); 
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/6">
        <Adm_Sidebar />
      </div>

      <div className="flex flex-col w-5/6 p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Create aptitude test
        </h2>

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
          <form >
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
          </form>
        </div>

        <div className="flex items-center space-x-4 mt-28">
          <button
            type="submit"
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
            onClick={handleCreateQuestions}
          >
            Create questions
          </button>
          <button
            type="button"
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
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
