import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import io from "socket.io-client";
import Sidebar from "../../components/student/mcqexampage/Sidebar";
import {
  setSelectedOption,
  visitQuestion,
  clearQuestions,
  toggleMarkForReview,
} from "../../redux/questionSlice";
import { clearExamId } from "../../redux/ExamSlice";
import NoCopyComponent from "../../components/student/mcqexampage/NoCopyComponent";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./MCQExamPage.css";

const Stu_MCQExamPage = () => {
  const socketRef = useRef(null);
  const dispatch = useDispatch();
  const { examId } = useParams();
  const navigate = useNavigate();
  const exam = useSelector((state) => state.exam.exam);
  const location = useLocation();
  const Duration = location.state?.Duration;
  const userId = useSelector((state) => state.user.user.id);
  const userName = useSelector((state) => state.user.user.name);
  const userEmail = useSelector((state) => state.user.user.email);
  const { questions, currentQuestionIndex } = useSelector(
    (state) => state.questions
  );

  const [fullscreenError, setFullscreenError] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [timeUp, setTimeUp] = useState(false);

  const formatTimeFromSeconds = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

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

  const submitFinalResponse = async () => {
    const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
    const url = `${API_BASE_URL}/api/exams/responses/final/${examId}`;
    await axios.put(url, {}, { withCredentials: true });
  };

  useEffect(() => {
    const disableKeyboard = (e) => e.preventDefault();
    window.addEventListener("keydown", disableKeyboard);
    return () => window.removeEventListener("keydown", disableKeyboard);
  }, []);

  useEffect(() => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion && !currentQuestion.visited) {
      dispatch(visitQuestion(currentQuestionIndex));
    }
  }, [dispatch, questions, currentQuestionIndex]);

  useEffect(() => {
    const socketConnect = async () => {
      if (!socketRef.current) {
        const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
        socketRef.current = io(`${API_BASE_URL}/exams/start-exam`, {
          withCredentials: true,
        });
      }

      const socket = socketRef.current;
      socket.emit("start_exam", {
        exam_id: examId,
        duration: Duration * 60,
      });

      socket.on("timer_update", (data) => setRemainingTime(data.remainingTime));
      socket.on("exam_ended", () => {
        submitFinalResponse();
        setTimeUp(true);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.off("connect");
          socketRef.current.off("timer_update");
          socketRef.current.off("exam_ended");
          socketRef.current.disconnect();
        }
      };
    };
    socketConnect();
  }, []);

  useEffect(() => {
    if (timeUp) handleSubmitTest();
  }, [timeUp]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !testSubmitted) {
        setFullscreenError(true);
      }
    };

    if (!testSubmitted) {
      document.addEventListener("fullscreenchange", handleFullscreenChange);
    }

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [testSubmitted]);

  const handleOptionSelect = (option, id) => {
    dispatch(setSelectedOption({ index: currentQuestionIndex, option }));
    singleResponse(option, id);
  };

  const singleResponse = async (option, id) => {
    const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
    const url = `${API_BASE_URL}/api/exams/responses/${examId}`;
    const payload = {
      question_id: id,
      selected_option: option,
      response_status: "draft",
    };
    await axios.put(url, payload, { withCredentials: true });
  };

  const handleOffline = () => {
    alert("You are offline. Some features may not be available.");
    navigate("/home", { replace: true });
  };

  useEffect(() => {
    window.addEventListener("offline", handleOffline);
    return () => window.removeEventListener("offline", handleOffline);
  }, []);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      dispatch(visitQuestion(currentQuestionIndex + 1));
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      dispatch(visitQuestion(currentQuestionIndex - 1));
    }
  };

  const handleSubmitTest = async () => {
    setTestSubmitted(true);
    await submitFinalResponse();
    socketRef.current.emit("submit_responses");
    dispatch(clearExamId(examId));
    dispatch(clearQuestions());
    alert("Test submitted successfully!");
    navigate("/home", { replace: true });
  };

  const handleClearResponse = async (id) => {
    // const questionId = questions[currentQuestionIndex]?.question_id;
    // if (!questionId) return;

    const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
    const url = `${API_BASE_URL}/api/exams/responses/exams/clear-response`;

    try {
      await axios.put(url, { studentId:userId,examId: Number(examId), questionId: id }, { withCredentials: true });
      dispatch(setSelectedOption({ index: currentQuestionIndex, option: null }));
    } catch (error) {
      console.error("Error clearing response:", error);
    }
  };
  const handleMarkForReview = () => {
    dispatch(toggleMarkForReview(currentQuestionIndex));
  };
  return (
    <div className="relative flex-1">
      {/* Main Content */}
      <div className="flex h-screen bg-[#F5F6F8]">
        <NoCopyComponent onPermissionGranted={enableFullscreen} />
        {fullscreenError && !testSubmitted && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
              <h2 className="text-lg font-semibold mb-4 text-red-500">
                Fullscreen Mode Required
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                You have exited fullscreen mode. Please return to fullscreen to
                continue the exam.
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

        <div className="w-9/12 2xl:w-11/12 h-screen px-8 py-6 bg-[#F5F6F8]">
          {exam
            ?.filter((examItem) => examItem.exam_id === Number(examId))
            .map((examItem) => (
              <h1
                key={examItem.exam_id}
                className="text-xl font-bold text-gray-800 mb-4"
              >
                {examItem.exam_name}
              </h1>
            ))}

          <div className="relative bg-white p-6 rounded-xl shadow-lg h-5/6 mt-8 overflow-hidden">
            {/* Watermark Overlay */}
            <div className="watermark-overlay">
              {Array.from({ length: 300 }).map((_, index) => (
                <div key={index} className="watermark-text">
                  {userEmail}
                </div>
              ))}
            </div>

            {/* Main Content */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black select-none">
                {currentQuestionIndex + 1}.{" "}
                {questions[currentQuestionIndex]?.question_text || "Loading..."}
              </h2>
              <span className="font-sans text-center text-sm flex items-center border-2 p-1 border-blue-500 rounded-md">
                {formatTimeFromSeconds(remainingTime)}
              </span>
            </div>

            <div className="space-y-4">
              {Object.entries(
                questions[currentQuestionIndex]?.options || {}
              ).map(([key, value]) => (
                <label
                  key={key}
                  className="block p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    className="mr-2"
                    checked={
                      questions[currentQuestionIndex]?.selectedOption === key
                    }
                    onChange={() =>
                      handleOptionSelect(
                        key,
                        questions[currentQuestionIndex]?.question_id
                      )
                    }
                  />
                  {value}
                </label>
              ))}
            </div>

            <div className="absolute bottom-5 w-full flex justify-between">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-lg disabled:bg-gray-300"
                disabled={currentQuestionIndex === 0}
                onClick={handlePreviousQuestion}
              >
                Previous
              </button>
              <button
                  className="px-4 py-2 bg-red-500 text-white rounded-lg"
                  onClick= {  () => handleClearResponse(  questions[currentQuestionIndex]?.question_id)}
                >
                  Clear
                </button>

                <button
                  className="px-4 py-2 rounded-lg bg-purple-500 text-white"
                  onClick={handleMarkForReview}
                >
                  {questions[currentQuestionIndex]?.markedForReview ? "Mark for Review" : "Mark for Review"}
                </button>
              <button
                className="px-4 py-2 mr-10 bg-blue-500 text-white rounded-lg disabled:bg-gray-300"
                disabled={currentQuestionIndex === questions.length - 1}
                onClick={handleNextQuestion}
              >
                Next
              </button>
            </div>
          </div>
        </div>
        <Sidebar name={userName} onSubmitTest={handleSubmitTest} />
      </div>
    </div>
  );
};

export default Stu_MCQExamPage;
