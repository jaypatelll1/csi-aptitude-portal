import React, { useEffect, useState, useRef } from "react";
import Dep_PresidentViewQuestionCard from "../../components/depPresident/Dep_PresidentViewQuestionCard";
import Dep_PresidentSidebar from "../../components/depPresident/Dep_PresidentSidebar";
import DataTime from "../../components/depPresident/Dep_PresidentDataTime";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { clearExamId } from "../../redux/ExamSlice";
// const API_BASE_URL = process.env.BACKEND_BASE_URL;

const Dep_PresidentViewQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [testDuration, setTestDuration] = useState();
  const sidebarRef = useRef(null);
  let examId = useSelector((state) => state.exam.examId);
  // console.log("exam_id is ", examId);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (!examId) {
          throw new Error("Exam ID is not defined");
        }
        let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
        const response = await axios.get(
          `${API_BASE_URL}/api/exams/questions/${examId}`,
          {
            withCredentials: true, // Make sure the cookie is sent with the request
          }
        );
      

        setQuestions(response.data || []);
      } catch (err) {
        setError(err.message || "Error fetching questions");
      } finally {
        setLoading(false);
      }
    };

    const fetchDuration = async () => {
      try {
        const id = examId;
       
        let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
        const response = await axios.get(
          `${API_BASE_URL}/api/exams/find/${id}`,
          {
            withCredentials: true, // Make sure the cookie is sent with the request
          }
        );
      
        setTestDuration(response.data.exam.duration);
      } catch (err) {
        console.error("Error fetching test duration:", err.message);
      }
    };

    fetchQuestions();
    fetchDuration();
  }, [examId]);

  // const updateQuestionText = (questionId, newText) => {
  //   setQuestions((prevQuestions) =>
  //     prevQuestions.map((question) =>
  //       question.question_id === questionId
  //         ? { ...question, question_text: newText }
  //         : question
  //     )
  //   );
  // };

  const handleGoBack = () => {
    navigate("/admin/input");
  };

  const handleSchedulePost = () => {
    setScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    setScheduleModalOpen(false);
  };

  const handleSaveDraft = () => {
    navigate("/president");
    dispatch(clearExamId());
  };

  const handleScheduleTest = (startTime, endTime) => {
    const id = examId;
  

    if (!id) {
      alert("Exam ID is not available.");
      return;
    }
    let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
    axios
      .put(
        `${API_BASE_URL}/api/exams/publish/${id}`,
        {
          start_time: startTime,
          end_time: endTime,
        },
        {
          withCredentials: true, // Make sure the cookie is sent with the request
        }
      )
      .then(() => {
        closeScheduleModal();
      
        dispatch(clearExamId()); // Dispatch clearing examId here to ensure it runs after successful API call
        navigate("/president"); // Navigate to /admin after successful test scheduling
      })
      .catch((err) =>
        alert(
          `Error scheduling test: ${err.response?.data?.message || err.message}`
        )
      );
  };

  const handleDelete = async () => {

    let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;

    await axios.delete(`${API_BASE_URL}/api/exams/${examId}`, {
      withCredentials: true, // Make sure the cookie is sent with the request
    });
 
    navigate("/president/createtest");
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

      <div className="flex-1 p-4 sm:p-6">
        <div className="flex items-center mb-4 sm:mb-6">
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
          <h1 className="text-xl sm:text-2xl font-bold ml-20 sm:ml-52 xl:m-0">
            Create Aptitude Test
          </h1>
        </div>

        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-800"
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
          <div className="flex space-x-2 items-end">
            <button
              onClick={handleSaveDraft}
              className="bg-white border border-gray-300 text-gray-700 font-thin sm:py-2 px-1 sm:px-4 rounded-lg hover:bg-gray-100"
            >
              Save as Draft
            </button>
            <button
              onClick={handleSchedulePost}
              className="bg-white border border-gray-300 text-gray-700 py-1 sm:py-2 px-1 sm:px-4 rounded-lg hover:bg-gray-100"
            >
              Schedule Post
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 border border-gray-300 text-gray-700 py-1 sm:py-2 px-1 sm:px-4 rounded-lg hover:bg-red-500"
            >
              Delete Exam
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p>Loading questions...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            questions.map((question, index) => (
              <Dep_PresidentViewQuestionCard
                key={question.question_id}
                id={question.question_id}
                index={index}
                question_type={question.question_type}
                text={question.question_text}
                options={question.options}
                correct_option={question.correct_option}
                correct_options={question.correct_options}
                category={question.category}
                image_url={question.image_url}
              />
            ))
          )}
        </div>
      </div>

      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <DataTime
            duration={testDuration}
            onCancel={closeScheduleModal}
            onSchedule={handleScheduleTest}
          />
        </div>
      )}
    </div>
  );
};

export default Dep_PresidentViewQuestions;