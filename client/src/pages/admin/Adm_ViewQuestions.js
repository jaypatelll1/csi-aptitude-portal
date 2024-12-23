import React from "react";
import Adm_ViewQuestionCard from "../../components/Admin/Adm_ViewQuestionCard";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";

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

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-full md:w-1/6">
        <Adm_Sidebar />
      </div>
      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100">
        <h1 className="text-xl font-bold mb-6">Create Aptitude Test</h1>
        <h2 className="text-lg font-semibold mb-4">Question Summary</h2>
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