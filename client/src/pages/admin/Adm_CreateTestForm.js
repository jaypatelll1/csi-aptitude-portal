import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateTestPage = () => {
  const [testName, setTestName] = useState("");
  const [numQuestions, setNumQuestions] = useState("");
  const navigate = useNavigate();

  const handleCreateQuestions = (e) => {
    e.preventDefault();
    console.log({ testName, numQuestions });
  };

  const handleCancel = () => {
    setTestName("");
    setNumQuestions("");
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
          <form onSubmit={handleCreateQuestions}>
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
                htmlFor="numQuestions"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Number of questions
              </label>
              <input
                type="number"
                id="numQuestions"
                placeholder="Eg. 30"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                required
              />
            </div>
          </form>
        </div>

        <div className="flex items-center space-x-4 mt-28">
          <button
            type="submit"
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
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
