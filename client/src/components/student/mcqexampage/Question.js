import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import io from "socket.io-client";
import {
  setSelectedOption,
  visitQuestion,
  toggleMarkForReview,
  setMultipleSelectedOption,
  setTextAnswer,
  clearQuestions,
  clearResponse, // Add this action to your Redux slice
} from "../../../redux/questionSlice";
import { clearExamId } from "../../../redux/ExamSlice";
import { useLocation, useNavigate } from "react-router-dom";

const Question = () => {
  const socketRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const Duration = location.state?.Duration;
  const examId = location.state?.examId;
  
  // Redux state
  const exam = useSelector((state) => state.exam.exam);
  const userEmail = useSelector((state) => state.user.user.email);
  const userId = useSelector((state) => state.user.user.id);
  const { questions, currentQuestionIndex } = useSelector((state) => state.questions);

  // Local state for multiple options, text answers, and socket timer
  const [multipleAnswers, setMultipleAnswers] = useState({});
  const [textAnswers, setTextAnswers] = useState({});
  const [remainingTime, setRemainingTime] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);

  // Local state to track unsaved changes and prevent multiple requests
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingResponse, setPendingResponse] = useState(null);
  const [isSaving, setIsSaving] = useState(false); // Prevent multiple save requests

  const currentQuestion = questions[currentQuestionIndex] || null;
  const questionId = currentQuestion?.question_id;

  const formatTimeFromSeconds = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const submitFinalResponse = async () => {
    const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
    const url = `${API_BASE_URL}/api/exams/responses/final/${examId}`;
    await axios.put(url, {}, { withCredentials: true });
  };

  const handleSubmitTest = async () => {
    setTestSubmitted(true);
    await submitFinalResponse();
    socketRef.current?.emit("submit_responses");
    dispatch(clearExamId(examId));
    dispatch(clearQuestions());
    alert("Test submitted successfully!");
    navigate("/home", { replace: true });
  };

  // Socket connection and timer management
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
      
socket.on("already_active", ({ message }) => {
    alert(message || "Already logged in for this exam.");
    navigate("/home", { replace: true });
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

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [examId, Duration]);

  // Handle time up
  useEffect(() => {
    if (timeUp) handleSubmitTest();
  }, [timeUp]);

  // Initialize local state with existing answers (for when user returns after internet issues)
  useEffect(() => {
    const initializeAnswers = () => {
      const multipleAnswersInit = {};
      const textAnswersInit = {};
      
      questions.forEach((question, index) => {
        if (question.question_type === 'multiple_choice' && question.selectedOptions) {
          multipleAnswersInit[question.question_id] = question.selectedOptions;
        }
        if (question.question_type === 'text' && question.textAnswer) {
          textAnswersInit[question.question_id] = question.textAnswer;
        }
      });
      
      setMultipleAnswers(multipleAnswersInit);
      setTextAnswers(textAnswersInit);
    };
    
    if (questions.length > 0) {
      initializeAnswers();
    }
  }, [questions]);

  // Mark current question as visited
  useEffect(() => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion && !currentQuestion.visited) {
      dispatch(visitQuestion(currentQuestionIndex));
    }
  }, [dispatch, questions, currentQuestionIndex]);

  // Modified option select handlers - only update local state, don't send to backend
  const handleOptionSelect = (option) => {
    // Clear the cleared flag when selecting an option
    dispatch(setSelectedOption({ index: currentQuestionIndex, option, cleared: false }));
    // Mark as temporarily answered (for sidebar display) but not saved
    setHasUnsavedChanges(true);
    setPendingResponse({
      type: 'single',
      data: { option, questionId: currentQuestion?.question_id, questionType: currentQuestion?.question_type }
    });
  };

  const handleMultipleOptionsSelect = (options) => {
    const questionId = currentQuestion?.question_id;
    setMultipleAnswers({
      ...multipleAnswers,
      [questionId]: options,
    });
    // Clear the cleared flag when selecting options
    dispatch(setMultipleSelectedOption({ index: currentQuestionIndex, options, cleared: false }));
    // Mark as temporarily answered (for sidebar display) but not saved
    setHasUnsavedChanges(true);
    setPendingResponse({
      type: 'multiple',
      data: { options, questionId, questionType: currentQuestion?.question_type }
    });
  };

  const handleTextChange = (text) => {
    const questionId = currentQuestion?.question_id;
    setTextAnswers({
      ...textAnswers,
      [questionId]: text,
    });
    // Clear the cleared flag when typing text
    dispatch(setTextAnswer({ index: currentQuestionIndex, text, cleared: false }));
    // Mark as temporarily answered (for sidebar display) but not saved
    setHasUnsavedChanges(true);
    setPendingResponse({
      type: 'text',
      data: { text, questionId, questionType: currentQuestion?.question_type }
    });
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
      selected_options: options,
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

  // Function to save pending response to backend with duplicate request prevention
  const savePendingResponse = async () => {
    if (!pendingResponse || isSaving) return;

    setIsSaving(true); // Prevent multiple simultaneous requests
    
    try {
      const { type, data } = pendingResponse;
      
      switch (type) {
        case 'single':
         
          dispatch(setSelectedOption({ index: currentQuestionIndex, option: data.option, answered: true, cleared: false }));
          break;
        case 'multiple':
          
          dispatch(setMultipleSelectedOption({ index: currentQuestionIndex, options: data.options, answered: true, cleared: false }));
          break;
        case 'text':
          
          dispatch(setTextAnswer({ index: currentQuestionIndex, text: data.text, answered: true, cleared: false }));
          break;
      }
      
      setHasUnsavedChanges(false);
      setPendingResponse(null);
    } catch (error) {
      console.error("Error saving response:", error);
    } finally {
      setIsSaving(false); // Reset saving state
    }
  };

  const saveCurrentReduxAnswer = () => {
    const questionType = currentQuestion?.question_type;
    if (!currentQuestion) return;
    switch (questionType) {
      case 'single_choice':
        if (currentQuestion.selectedOption !== undefined && currentQuestion.selectedOption !== null) {
          dispatch(setSelectedOption({ index: currentQuestionIndex, option: currentQuestion.selectedOption, answered: true, cleared: false }));
        }
        break;
      case 'multiple_choice':
        if (currentQuestion.selectedOptions && currentQuestion.selectedOptions.length > 0) {
          dispatch(setMultipleSelectedOption({ index: currentQuestionIndex, options: currentQuestion.selectedOptions, answered: true, cleared: false }));
        }
        break;
      case 'text':
        if (currentQuestion.textAnswer && currentQuestion.textAnswer.trim() !== "") {
          dispatch(setTextAnswer({ index: currentQuestionIndex, text: currentQuestion.textAnswer, answered: true, cleared: false }));
        }
        break;
      default:
        break;
    }
  };

  const handleNextQuestion = async () => {
    if (isSaving) return;
    if (hasUnsavedChanges && pendingResponse) {
      await savePendingResponse();
    } else {
      saveCurrentReduxAnswer();
    }
    if (currentQuestionIndex < questions.length - 1) {
      dispatch(visitQuestion(currentQuestionIndex + 1));
    }
  };

  const handleSaveCurrentQuestion = async () => {
    if (isSaving) return;
    if (hasUnsavedChanges && pendingResponse) {
      await savePendingResponse();
    } else {
      saveCurrentReduxAnswer();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      dispatch(visitQuestion(currentQuestionIndex - 1));
      // Reset unsaved changes when navigating away without saving
      setHasUnsavedChanges(false);
      setPendingResponse(null);
    }
  };

  const handleClearResponse = async (id) => {


    try {
     

      if (currentQuestion?.question_type === "single_choice") {
        dispatch(setSelectedOption({ index: currentQuestionIndex, option: null, answered: false, cleared: true }));
      } else if (currentQuestion?.question_type === "multiple_choice") {
        // Clear both local state and Redux state
        setMultipleAnswers({
          ...multipleAnswers,
          [id]: [],
        });
        dispatch(setMultipleSelectedOption({ index: currentQuestionIndex, options: [], answered: false, cleared: true }));
      } else if (currentQuestion?.question_type === "text") {
        // Clear both local state and Redux state
        setTextAnswers({
          ...textAnswers,
          [id]: "",
        });
        dispatch(setTextAnswer({ index: currentQuestionIndex, text: "", answered: false, cleared: true }));
      }

      // Clear pending response
      setHasUnsavedChanges(false);
      setPendingResponse(null);
    } catch (error) {
      console.error("Error clearing response:", error);
    }
  };

  const handleMarkForReview = () => {
    dispatch(toggleMarkForReview(currentQuestionIndex));
  };

  const renderQuestionInput = () => {
    const questionType = currentQuestion?.question_type;
    const options = currentQuestion?.options || {};
    const selectedOption = currentQuestion?.selectedOption;
    
    // Use local state for multiple choice and text answers to ensure persistence
    const questionId = currentQuestion?.question_id;
    const selectedOptions = multipleAnswers[questionId] || currentQuestion?.selectedOptions || [];
    const textAnswer = textAnswers[questionId] || currentQuestion?.textAnswer || "";

    switch (questionType) {
      case "single_choice":
        return (
          <div className="mt-4 space-y-3">
            {Object.entries(options).map(([key, value], index) => (
              <label
                key={index}
                className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100"
              >
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex + 1}`}
                  value={key}
                  checked={key === selectedOption}
                  onChange={() => handleOptionSelect(key)}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700 text-base">{value}</span>
              </label>
            ))}
          </div>
        );

      case "multiple_choice":
        return (
          <div className="mt-4 space-y-3">
            {Object.entries(options).map(([key, value], index) => (
              <label
                key={index}
                className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  name={`option-${currentQuestionIndex + 1}-${index}`}
                  value={key}
                  checked={selectedOptions?.includes(key)}
                  onChange={() => {
                    if (selectedOptions?.includes(key)) {
                      handleMultipleOptionsSelect(selectedOptions.filter((item) => item !== key));
                    } else {
                      handleMultipleOptionsSelect([...(selectedOptions || []), key]);
                    }
                  }}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700 text-base">{value}</span>
              </label>
            ))}
          </div>
        );

      case "text":
        return (
          <div className="mt-4">
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
              rows="4"
              value={textAnswer || ""}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Type your answer here..."
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="w-9/12 2xl:w-11/12 h-screen px-8 py-6 bg-[#F5F6F8]">
      {exam
        ?.filter((examItem) => examItem.exam_id === Number(examId))
        .map((examItem) => (
          <h1 key={examItem.exam_id} className="text-xl font-bold text-gray-800 mb-4">
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

        {/* Question Content */}
        <div className="bg-white rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {currentQuestionIndex + 1}. {currentQuestion.question_text || "Loading..."}
            </h3>
          </div>

          {currentQuestion.image_url && (
            <div className="mb-4 flex justify-center">
              <img
                src={currentQuestion.image_url}
                alt={`Image for question ${currentQuestionIndex + 1}`}
                className="max-w-[400px] max-h-[300px] w-auto h-auto object-contain rounded-md"
              />
            </div>
          )}

          {renderQuestionInput()}
        </div>

        {/* Control Buttons */}
        <div className="absolute bottom-5 w-full flex justify-between px-8">
          <div className="flex gap-4">
            <button
              className="px-4 py-2 bg-[#939191] text-white rounded-lg disabled:bg-gray-300"
              disabled={currentQuestionIndex === 0}
              onClick={handlePreviousQuestion}
            >
              Previous
            </button>
            <button
              className="px-4 py-2 bg-[#D0150ACC] text-white rounded-lg"
              onClick={() => handleClearResponse(currentQuestion?.question_id)}
            >
              Clear
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-[#8A2BE2CC] text-white"
              onClick={handleMarkForReview}
            >
              {currentQuestion?.markedForReview ? "Unmark Review" : "Mark for Review"}
            </button>
          </div>
          
          {/* Conditional button based on whether it's the last question */}
          {isLastQuestion ? (
            <button
              className={`px-4 py-2 text-white rounded-lg ${
                isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
              }`}
              onClick={handleSaveCurrentQuestion}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          ) : (
            <button
              className={`px-4 py-2 text-white rounded-lg ${
                isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
              }`}
              onClick={handleNextQuestion}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save & Next'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Question;