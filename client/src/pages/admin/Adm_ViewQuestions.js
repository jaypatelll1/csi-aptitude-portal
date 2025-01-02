import React, { useEffect, useState, useRef } from "react";
import Adm_ViewQuestionCard from "../../components/admin/Adm_ViewQuestionCard";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import Adm_DataTime from "../../components/admin/Adm_DataTime";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

const Adm_ViewQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false); // State for modal
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for toggling sidebar
  const sidebarRef = useRef(null);
  const examId = useSelector((state) => state.exam.examId);
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

  const handleSchedulePost = () => {
    setScheduleModalOpen(true); // Open the modal
  };

  const closeScheduleModal = () => {
    setScheduleModalOpen(false); // Close the modal
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
      {/* Sidebar Section */}
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
            <button
              onClick={handleSchedulePost}
              className="bg-white border border-gray-300 text-gray-700 font-thin py-2 px-4 rounded-lg hover:bg-gray-100"
            >
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
            questions.map((question, index) => (
              <Adm_ViewQuestionCard
                key={question.question_id}
                id={question.question_id}
                index={index}
                text={question.question_text}
                updateText={updateQuestionText}
                options={question.options} // Pass update function to child
              />
            ))
          )}
        </div>
      </div>

      {/* Modal for Schedule Test */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Adm_DataTime
            onCancel={closeScheduleModal} // Pass the close function as a prop
          />
        </div>
      )}
    </div>
  );
};

export default Adm_ViewQuestions;
