import React from "react";
import Adm_ViewQuestionCard from "../../components/admin/Adm_ViewQuestionCard";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import { useNavigate } from "react-router-dom";

const Adm_ViewQuestions = () => {
  const questions = [
    {
      id: 1,
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam",
    },
    {
      id: 2,
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam",
    },
    {
      id: 3,
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam",
    },
    {
      id: 4,
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam",
    },
  ];
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <div className="w-full md:w-1/6">
        <Adm_Sidebar />
      </div>

      <div className="flex-1 p-6 bg-gray-100">
        <h1 className="text-lg font-normal mb-6">Create Aptitude Test</h1>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
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
            <h2 className="text-lg font-semibold">Question Summary</h2>
          </div>

          <div className="flex gap-4">
            <button className="bg-white border border-gray-300 text-gray-700 font-thin py-2 px-4 rounded-lg hover:bg-gray-100">
              Save as Draft
            </button>
            <button className="bg-white border border-gray-300 text-gray-700 font-thin py-2 px-4 rounded-lg hover:bg-gray-100">
              Schedule Post
            </button>
            <button className="bg-[#533FCC] text-white font-thin py-2 px-6 rounded-lg hover:bg-[#412eb5]">
              Submit
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((question) => (
            <Adm_ViewQuestionCard
              key={question.id}
              id={question.id}
              text={question.text}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Adm_ViewQuestions;
