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
  setMultipleSelectedOption,
  setTextAnswer,
  // We'll use the existing setSelectedOption action for all question types
} from "../../redux/questionSlice";
import { clearExamId } from "../../redux/ExamSlice";
import NoCopyComponent from "../../components/student/mcqexampage/NoCopyComponent";
import Question from "../../components/student/mcqexampage/Question";
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

  // Local state to handle multiple options and text answers
  const [multipleAnswers, setMultipleAnswers] = useState({});
  const [textAnswers, setTextAnswers] = useState({});

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

  // useEffect(() => {
  //   const disableKeyboard = (e) => {
  //     // Get the current question from state
  //     const currentQuestion = questions[currentQuestionIndex];
      
  //     // Only prevent default if the question type is NOT text
  //     if (currentQuestion && currentQuestion.question_type !== "text") {
  //       e.preventDefault();
  //     }
  //     // For text questions, allow keyboard input
  //   };
    
  //   window.addEventListener("keydown", disableKeyboard);
  //   return () => window.removeEventListener("keydown", disableKeyboard);
  // }, [currentQuestionIndex, questions]);

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

  const handleOptionSelect = (option) => {
    const currentQuestion = questions[currentQuestionIndex];
    dispatch(setSelectedOption({ index: currentQuestionIndex, option }));
    singleResponse(
      option,
      currentQuestion?.question_id,
      currentQuestion?.question_type
    );
  };

  const handleMultipleOptionsSelect = (options) => {
    const currentQuestion = questions[currentQuestionIndex];
    const questionId = currentQuestion?.question_id;

    // Store in local state
    setMultipleAnswers({
      ...multipleAnswers,
      [questionId]: options,
    });
    dispatch(setMultipleSelectedOption({ index: currentQuestionIndex, options }));
    multipleResponse(options, questionId, currentQuestion?.question_type);
  };

  const handleTextChange = (text) => {
    const currentQuestion = questions[currentQuestionIndex];
    const questionId = currentQuestion?.question_id;

    // Store in local state
    setTextAnswers({
      ...textAnswers,
      [questionId]: text,
    });
    dispatch(setTextAnswer({ index: currentQuestionIndex, text }));
    textResponse(text, questionId, currentQuestion?.question_type);
  };

  const singleResponse = async (option, id, question_type) => {
    const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
    const url = `${API_BASE_URL}/api/exams/responses/${examId}`;
    const payload = {
      question_id: id,
      selected_option: option,
      selected_options: null,
      text_answer: null,
      question_type,
    };
    await axios.put(url, payload, { withCredentials: true });
  };

  const multipleResponse = async (options, id, question_type) => {
    const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
    const url = `${API_BASE_URL}/api/exams/responses/${examId}`;
    const payload = {
      question_id: id,
      selected_option: null,
      selected_options: options, // Array of selected options
      text_answer: null,
      question_type,
    };
    await axios.put(url, payload, { withCredentials: true });
  };

  const textResponse = async (text, id, question_type) => {
    const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
    const url = `${API_BASE_URL}/api/exams/responses/${examId}`;
    const payload = {
      question_id: id,
      selected_option: null,
      selected_options: null,
      text_answer: text,
      question_type,
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
    const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
    const url = `${API_BASE_URL}/api/exams/responses/exams/clear-response`;

    try {
      await axios.put(
        url,
        { studentId: userId, examId: Number(examId), questionId: id },
        { withCredentials: true }
      );

      const currentQuestion = questions[currentQuestionIndex];
      if (
        currentQuestion?.questionType === "single" ||
        !currentQuestion?.questionType
      ) {
        dispatch(
          setSelectedOption({ index: currentQuestionIndex, option: null })
        );
      } else if (currentQuestion?.questionType === "multiple") {
        // Clear multiple options in local state
        setMultipleAnswers({
          ...multipleAnswers,
          [id]: [],
        });
      } else if (currentQuestion?.questionType === "text") {
        // Clear text answer in local state
        setTextAnswers({
          ...textAnswers,
          [id]: "",
        });
      }
    } catch (error) {
      console.error("Error clearing response:", error);
    }
  };

  const handleMarkForReview = () => {
    dispatch(toggleMarkForReview(currentQuestionIndex));
  };

  // useEffect(() => {
  //   let warningCount = 0;

  // const handleTabSwitch = () => {
  //   if (document.hidden) {
  //     warningCount++;

  //     if (warningCount < 5) {
  //       alert(` Tab switching detected! Warning ${warningCount}/5. Stay on the exam page.`);
  //     } else {
  //       alert("You have switched tabs too many times. Your test is now being submitted.");
  //       handleSubmitTest();
  //     }
  //   }
  // };

  //   document.addEventListener("visibilitychange", handleTabSwitch);

  //   return () => {
  //     document.removeEventListener("visibilitychange", handleTabSwitch);
  //   };
  // }, []);

  const getCurrentQuestion = () => {
    return questions[currentQuestionIndex] || null;
  };

  const currentQuestion = getCurrentQuestion();
  const questionId = currentQuestion?.question_id;

  // Get appropriate answers from state based on question type
  const getSelectedOptions = () => {
    if (currentQuestion?.question_type === "multiple_choice") {
      return multipleAnswers[questionId] || [];
    } else {
      return currentQuestion?.selectedOption
        ? [currentQuestion.selectedOption]
        : [];
    }
  };

  const getTextAnswer = () => {
    return textAnswers[questionId] || "";
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

            {/* Timer Display */}
            <div className="flex justify-end mb-4">
              <span className="font-sans text-center text-sm flex items-center border-2 p-1 border-blue-500 rounded-md">
                {formatTimeFromSeconds(remainingTime)}
              </span>
            </div>

            {/* Question Component */}
            {currentQuestion && (
              <Question
              questionNumber={currentQuestionIndex + 1}
              question={currentQuestion.question_text || "Loading..."}
              questionType={currentQuestion.question_type || "single_choice"} 
              options={currentQuestion.options || {}}
              selectedOption={currentQuestion.selectedOption} // Use camelCase to match Redux
              selectedOptions={currentQuestion.selectedOptions || []} // Use camelCase to match Redux
              textAnswer={currentQuestion.textAnswer || ""} // Use camelCase to match Redux
              imageUrl={currentQuestion.image_url}
              onSelectOption={handleOptionSelect}
              onSelectMultipleOptions={handleMultipleOptionsSelect}
              onTextChange={handleTextChange}
            />
            )}

            <div className="absolute bottom-5 w-full flex justify-between pr-8">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-lg disabled:bg-gray-300"
                disabled={currentQuestionIndex === 0}
                onClick={handlePreviousQuestion}
              >
                Previous
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
                onClick={() =>
                  handleClearResponse(currentQuestion?.question_id)
                }
              >
                Clear
              </button>

              <button
                className="px-4 py-2 rounded-lg bg-purple-500 text-white"
                onClick={handleMarkForReview}
              >
                {currentQuestion?.markedForReview
                  ? "Unmark Review"
                  : "Mark for Review"}
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300"
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
