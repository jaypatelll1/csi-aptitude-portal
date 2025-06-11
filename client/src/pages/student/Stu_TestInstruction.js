import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Stu_Sidebar from "../../components/student/Stu_Sidebar";
import { useLocation } from "react-router-dom";
import Adm_Navbar from "../../components/admin/Adm_Navbar";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setQuestions } from "../../redux/questionSlice";

// import { useSelector } from "react-redux";

const Stu_TestInstruction = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for toggling sidebar
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const location = useLocation();
  const examId = location.state?.examId;
  const Duration = location.state?.Duration;
  const dispatch = useDispatch();

  const exam = useSelector((state) => state.exam.exam);
  // console.log('exam',exam);

  // const Duration = useSelector((state)=>state.time)
  // console.log("examId", examId);
  // console.log("duration", Duration);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;

  useEffect(() => {
    const checkAndInitializeResponses = async () => {
      try {
        // Fetch user responses
        const response = await axios.get(
          `${API_BASE_URL}/api/exams/responses/user_id?status=draft`,
          { withCredentials: true }
        );

        if (!response.data.includes(examId)) {
          // If examId is not in responses, delete old and initialize new responses
          await axios.delete(`${API_BASE_URL}/api/exams/responses/questions/${examId}`, {
            withCredentials: true,
          });

          await axios.post(
            `${API_BASE_URL}/api/exams/responses/initialize/${examId}`,
            {},
            { withCredentials: true }
          );

          // console.log("Responses initialized successfully.");

          const fetchQuestions = async () => {
            try {
              const response = await axios.get(
                `${API_BASE_URL}/api/exams/questions/students/${examId}`,
                { withCredentials: true }
              );

              // Shuffle the questions to randomize the order
              const shuffleArray = (array) => {
                for (let i = array.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1)); // Random index
                  [array[i], array[j]] = [array[j], array[i]]; // Swap elements
                }
              };

              const questions = response.data;

              // Shuffle the array of questions
              shuffleArray(questions);

              let formattedQuestions = questions.map((q) => ({
                ...q,
                answered: false,
                visited: false,
                selectedOption: null,
                selectedOptions: null,
                textAnswer: null,
              }));
              dispatch(setQuestions(formattedQuestions));
            } catch (error) {
              console.error("Error fetching questions:", error.response || error);
            }
          };

          fetchQuestions();
        } else if (response.data.includes(examId)) {
          const responses = await axios.get(`${API_BASE_URL}/api/exams/responses/${examId}`, {
            withCredentials: true,
          });

          // Format questions with selected options directly in map()
          const formattedQuestions = responses.data.responses.map((q) => ({
            ...q,
            answered: q.selected_option !== null,
            visited: q.selected_option !== null,
            selectedOption: q.selected_option || null, // Directly use selected_option
            selectedOptions: q.selected_options || null,
            textAnswer: q.text_answer || null,
          }));

          // Dispatch once to update Redux state
          dispatch(setQuestions(formattedQuestions));
        }
      } catch (error) {
        console.error("Error in initiating responses:", error.response || error);
      }
    };

    if (examId) {
      checkAndInitializeResponses();
    }
  }, [examId]); // Depend on `examId` so it only runs when `examId` changes

  const handleStartTest = () => {
    console.log(examId);
    navigate(`/exam`, { state: { examId: examId, Duration: Duration }, replace: true });
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
        <Stu_Sidebar />
      </div>

      <div className="flex-1">
        <Adm_Navbar />
        <div className="h-screen bg-gray-50 p-4 rounded-lg flex flex-col justify-between flex-grow">
          <div>
            {exam
              .filter((examItem) => examItem.exam_id === examId) // Filter exams matching examId
              .map((examItem) => (
                <div key={examItem.exam_id}>
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
                              ? "M6 18L18 6M6 6l12 12" // Cross icon for "close"
                              : "M4 6h16M4 12h16M4 18h16" // Burger icon for "open"
                          }
                        />
                      </svg>
                    </button>

                    <h2 className="text-xl font-bold text-gray-800 ml-24 sm:ml-52 xl:ml-0">
                      Online Aptitude Test:{" "}
                      <span className="text-blue-600">{examItem.exam_name}</span>
                    </h2>
                  </div>

                 <div className="p-4 rounded-lg shadow-sm mt-4">
  <h3 className="text-lg font-semibold text-blue-600 mb-3">Test Instructions</h3>
  <hr className="w-full h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
  
  {/* Test Overview */}
  <div className="mb-6">
    <h4 className="text-md font-semibold text-gray-800 mb-2">Test Overview</h4>
    <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
      <li>
        <span className="font-semibold">Total Questions:</span> {examItem.total_questions} Multiple Choice Questions (MCQs)
      </li>
      <li>
        <span className="font-semibold">Duration:</span> {examItem.duration} minutes
      </li>
      <li>
        <span className="font-semibold">Marking Scheme:</span> Each question carries 1 mark | No negative marking
      </li>
    </ul>
  </div>

  {/* Important Guidelines */}
  <div className="mb-6">
    <h4 className="text-md font-semibold text-gray-800 mb-2">Important Guidelines</h4>
    
    {/* Navigation & Submission */}
    <div className="mb-4">
      <h5 className="text-sm font-semibold text-gray-700 mb-2">Navigation & Submission</h5>
      <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
        <li><span className="font-semibold">Visit all questions</span> before submitting your test</li>
        <li>Questions marked as <span className="font-semibold">'Review'</span> will be included in your final evaluation</li>
        <li><span className="font-semibold">Click 'Save and Next'</span> to ensure your answers are recorded</li>
      </ul>
    </div>

    {/* Technical Requirements */}
    <div className="mb-4">
      <h5 className="text-sm font-semibold text-gray-700 mb-2">Technical Requirements</h5>
      <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
        <li><span className="font-semibold">Do not refresh</span> the browser page during the test</li>
        <li><span className="font-semibold">Tab switching is strictly prohibited</span> and may result in automatic test termination</li>
        <li>Ensure stable internet connection throughout the test</li>
      </ul>
    </div>

    {/* Scoring */}
    <div className="mb-4">
      <h5 className="text-sm font-semibold text-gray-700 mb-2">Scoring</h5>
      <ul className="list-none text-gray-600 space-y-2 ml-4">
        <li><span className="text-green-600">✅</span> Correct answer: +1 mark</li>
        <li><span className="text-red-500">❌</span> Incorrect answer: 0 marks</li>
        <li><span className="text-gray-400">⚪</span> Unanswered: 0 marks</li>
      </ul>
    </div>
  </div>

  <hr className="w-full h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
  <p className="text-center text-gray-700 font-medium">
    Good luck with your test! Stay focused and manage your time wisely.
  </p>
</div>
                </div>
              ))}
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
    </div>
  );
};

export default Stu_TestInstruction;
