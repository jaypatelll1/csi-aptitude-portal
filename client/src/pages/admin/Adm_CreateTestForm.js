import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import React, { useState } from "react";

const CreateTestPage = () => {
  const [testName, setTestName] = useState("");
  const [numQuestions, setNumQuestions] = useState("");
  const [timeLimit, setTimeLimit] = useState("");

  const handleCreateQuestions = (e) => {
    e.preventDefault();
    console.log({ testName, numQuestions, timeLimit });
  };

  const handleCancel = () => {
    setTestName("");
    setNumQuestions("");
    setTimeLimit("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/6">
        <Adm_Sidebar />
      </div>

      <div className="flex  flex-col  w-5/6 mr-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 mt-4">
          Create aptitude test
        </h2>
        <div className="bg-white rounded-lg shadow-md p-6 w-full items-center justify-center  ">
          <form onSubmit={handleCreateQuestions}>
            <div className="mb-6">
              <label
                htmlFor="testName"
                className="block text-sm font-semibold mb-1"
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
                className="block text-sm font-semibold mb-1"
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

            <div className="mb-3">
              <label
                htmlFor="timeLimit"
                className="block text-sm font-semibold mb-1"
              >
                Time to complete the test
              </label>
              <input
                type="text"
                id="timeLimit"
                placeholder="Eg. 30:00 min"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                required
              />
            </div>
          </form>
        </div>
        <div className="flex items-center ">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 m-4"
              >
                Create questions
              </button>
              <button
                type="button"
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
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
