import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import { clearExamId, incrementTabSwitchCount, resetTabSwitchCount } from "../../redux/ExamSlice";
import { clearQuestions } from "../../redux/questionSlice";
import Sidebar from "../../components/student/mcqexampage/Sidebar";
import NoCopyComponent from "../../components/student/mcqexampage/NoCopyComponent";
import Question from "../../components/student/mcqexampage/Question";
import "./MCQExamPage.css";

const Stu_MCQExamPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const socketRef = useRef(null);

  const userName = useSelector((state) => state.user.user.name);
  const tabSwitchCount = useSelector((state) => state.exam.tabSwitchCount); // Get from Redux exam state
  const [fullscreenError, setFullscreenError] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add loading state

  const examId = location.state?.examId;
  const Duration = location.state?.Duration;
const questions = useSelector((state) => state.questions.questions);
// console.log(questions)
  const enableFullscreen = () => {
    const rootElement = document.documentElement;
    if (rootElement.requestFullscreen) {
      rootElement.requestFullscreen().catch((err) => {
        console.error("Fullscreen request failed:", err);
      });
    } else {
      console.warn("Fullscreen API is not supported in this browser.");
    }
  };
  const buildResponsesPayload = (questions) => {
    return questions.map((q) => ({
      question_id: q.question_id,
      selected_option: q.selectedOption || null,
      selected_options: q.selectedOptions ? JSON.stringify(q.selectedOptions) : null,
      text_answer: q.textAnswer || null,
      question_type: q.question_type
    }));
  };
  

  const submitFinalResponse = async (questions) => {
  const responses = buildResponsesPayload(questions); // 👈 prepare payload
// console.log(responses);
  try {
    const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
    const url = `${API_BASE_URL}/api/exams/responses/final/${examId}`;
    await axios.put(url, { responses }, { withCredentials: true });
    console.log("Final response submitted successfully");
  } catch (error) {
    console.error("Error submitting final response:", error);
    throw error;
  }
};

  const handleSubmitTest = async (questions) => {
    if (isSubmitting || testSubmitted) return; // Prevent multiple submissions
    
    setIsSubmitting(true);
    setTestSubmitted(true);
    
    try {
      await submitFinalResponse(questions);
      socketRef.current?.emit("submit_responses");
      
      // Clear Redux state
      dispatch(clearExamId(examId));
      dispatch(clearQuestions());
      dispatch(resetTabSwitchCount()); // Reset tab switch count
      
      alert("Test submitted successfully!");
      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Error during test submission:", error);
      alert("There was an error submitting your test. Please try again.");
      setIsSubmitting(false);
      setTestSubmitted(false);
    }
  };

  const handleOffline = () => {
    alert("You are offline. Some features may not be available.");
    navigate("/home", { replace: true });
  };


  useEffect(() => {
    window.addEventListener("offline", handleOffline);
    return () => window.removeEventListener("offline", handleOffline);
  }, []);



  

  // Disable keyboard input
  useEffect(() => {
    const disableKeyboard = (e) => {
      e.preventDefault();
      return false;
    };
    window.addEventListener("keydown", disableKeyboard, true);
    return () => {
      window.removeEventListener("keydown", disableKeyboard, true);
    };
  }, []);

  // Tab switch detection with Redux
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !testSubmitted && !isSubmitting) {
        dispatch(incrementTabSwitchCount());
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [testSubmitted, isSubmitting, dispatch]);

  // Tab switch limit enforcement
  useEffect(() => {
    const MAX_TAB_SWITCHES = 5;
    const remainingAttempts = MAX_TAB_SWITCHES - tabSwitchCount;

    if (tabSwitchCount > 0 && tabSwitchCount < MAX_TAB_SWITCHES && !testSubmitted && !isSubmitting) {
      alert(
        `Switching tabs is not allowed.\nYou have ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} left before the test is auto-submitted.`
      );
    }

    if (tabSwitchCount >= MAX_TAB_SWITCHES && !testSubmitted && !isSubmitting) {
      alert("You switched tabs too many times. The test will be submitted now.");
      handleSubmitTest(questions);
    }
  }, [tabSwitchCount, testSubmitted, isSubmitting]);



  // Handle time up
  useEffect(() => {
    if (timeUp && !isSubmitting) handleSubmitTest();
  }, [timeUp, isSubmitting]);

  // Fullscreen detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !testSubmitted && !isSubmitting) {
        setFullscreenError(true);
      }
    };
    if (!testSubmitted && !isSubmitting) {
      document.addEventListener("fullscreenchange", handleFullscreenChange);
    }
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [testSubmitted, isSubmitting]);

  return (
    <div className="relative flex-1">
      <div className="flex h-screen bg-[#F5F6F8]">
        <NoCopyComponent onPermissionGranted={enableFullscreen} />
        {fullscreenError && !testSubmitted && !isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
              <h2 className="text-lg font-semibold mb-4 text-red-500">
                Fullscreen Mode Required
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                You have exited fullscreen mode. Please return to fullscreen to continue the exam.
              </p>
              <button
                onClick={() => {
                  setFullscreenError(false);
                  enableFullscreen();
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Re-enter Fullscreen
              </button>
            </div>
          </div>
        )}

        {/* Show loading indicator when submitting */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-700">Submitting your test...</p>
            </div>
          </div>
        )}

        <Question socketRef={socketRef} />
        <Sidebar name={userName} onSubmitTest={()=>handleSubmitTest(questions)} />
      </div>
    </div>
  );
};

export default Stu_MCQExamPage;