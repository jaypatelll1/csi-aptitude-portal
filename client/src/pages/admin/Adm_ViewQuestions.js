import React, { useEffect, useState } from "react";
import Adm_ViewQuestionCard from "../../components/admin/Adm_ViewQuestionCard";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

const Adm_ViewQuestions = () => {
  const [questions, setQuestions] = useState([]); // Initialize as an empty array
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const examId = useSelector((state) => state.exam.examId); // Redux state for exam ID
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch questions when component mounts
    const fetchQuestions = async () => {
      try {
        if (!examId) {
          throw new Error("Exam ID is not defined");
        }
        const response = await axios.get(`/api/exams/questions/${examId}`);
        console.log("response data is ", response.data);

        setQuestions(response.data || []); // Fallback to empty array if undefined
      } catch (err) {
        setError(err.message || "Error fetching questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [examId]);

  // Function to update a specific question's text
  const updateQuestionText = (questionId, newText) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((question) =>
        question.question_id === questionId
          ? { ...question, question_text: newText }
          : question
      )
    );
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate back
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

        {/* Render loading, error, or questions */}
        <div className="space-y-4">
          {loading ? (
            <p>Loading questions...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            questions.map((question, index,options) => (
              <Adm_ViewQuestionCard
                key={question.question_id}
                id={question.question_id}
                index={index}
                text={question.question_text}
                updateText={updateQuestionText}
                options = {question.options} // Pass update function to child
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Adm_ViewQuestions;
