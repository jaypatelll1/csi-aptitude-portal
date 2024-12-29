import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Msidebar from "../../components/student/home/MSidebar";

const TestInstruction = () => {
  const navigate = useNavigate();


  const handleStartTest = () => {
    navigate("/exam/1");
  };


  return (
    <div className="flex ">
      <Msidebar />
      <div className="h-screen ml-64 bg-gray-50 p-6 rounded-lg flex flex-col justify-between flex-grow">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Online Aptitude Test:{" "}
            <span className="text-blue-600">General Knowledge</span>
          </h2>
          <div className="p-4 rounded-lg shadow-sm mt-4">
            <h3 className="text-lg font-semibold text-blue-600 mb-3">
              Instructions:
            </h3>
            <hr className="w-full h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>
                <span className="font-semibold">Total number of questions:</span>{" "}
                40 MCQ’s.
              </li>
              <li>
                <span className="font-semibold">Time allotted:</span> 30 minutes.
              </li>
              <li>Each question carries 1 mark; there are no negative marks.</li>
              <li>Do not refresh the page.</li>
              <li>All the best!</li>
            </ul>
          </div>
        </div>
        <div className="flex justify-center mb-20">
          <button
            onClick={handleStartTest}
            className="bg-blue-500 text-white mb-8 px-20 py-3 rounded-lg text-md font-medium shadow-md hover:bg-blue-600"
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestInstruction;
