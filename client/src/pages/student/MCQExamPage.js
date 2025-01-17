import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import io from "socket.io-client";
import Sidebar from "../../components/student/mcqexampage/Sidebar";
import {
  setQuestions,
  setSelectedOption,
  visitQuestion,
} from "../../redux/questionSlice";
import NoCopyComponent from "../../components/student/mcqexampage/NoCopyComponent";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { markSubmit } from "../../redux/ExamSlice";
import Adm_Navbar from "../../components/admin/Adm_Navbar";


const MCQExamPage = () => {
  // const socket = io('/exams/start-exam');
  const socketRef = useRef(null);

  const dispatch = useDispatch();
  const { examId } = useParams();
  const navigate = useNavigate();
  // console.log('examid is ',examId);

  const location = useLocation();
  const Duration = location.state?.Duration;
  // console.log('duration is',Duration);

  const userId = useSelector((state) => state.user.user.id);
  const userName = useSelector((state) => state.user.user.name);

  // console.log('usesr id is ',userId);

  const { questions, currentQuestionIndex } = useSelector(
    (state) => state.questions
  );
  const [fullscreenError, setFullscreenError] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [timeUp, setTimeUp] = useState(false);

  // console.log(window.location.pathname); // Output: "/products/item"

  const formatTimeFromSeconds = (seconds) => {
    const hours = Math.floor(seconds / 3600); // Get total hours
    const minutes = Math.floor((seconds % 3600) / 60); // Get remaining minutes
    const remainingSeconds = seconds % 60; // Get remaining seconds

    // Format and return as HH:MM:SS
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
    } else if (rootElement.webkitRequestFullscreen) {
      rootElement.webkitRequestFullscreen();
    } else if (rootElement.msRequestFullscreen) {
      rootElement.msRequestFullscreen();
    } else {
      console.warn("Fullscreen API is not supported in this browser.");
    }
  };
  const submitFinalResponse = async () => {
    let url = `/api/exams/responses/final/${examId}`;
    const response = await axios.put(url);
    console.log("response is submit final", response.data);
  };

  const deleteExistingResponses = async () => {
    let url = `/api/exams/responses/initialize/${examId}`;
    const response = await axios.post(url);
    console.log("response is delete existing ", response.data);
  };

  useEffect(() => {
    const socketConnect = async () => {
      try {
        if (!socketRef.current) {
          socketRef.current = io("/exams/start-exam");
          console.log("Socket not connected, initializing...");
        }

        const socket = socketRef.current;

        // Handle socket connection
        socket.on("connect", () => {
          console.log("Connected to the exam namespace:", socket.id);

          // Call deleteExistingResponses only once when socket is connected
          deleteExistingResponses();
        });

        // Emit the start_exam event
        socket.emit("start_exam", {
          user_id: userId,
          exam_id: examId,
          duration: Duration * 60,
        });

        // Listen for timer updates
        socket.on("timer_update", (data) => {
          console.log("Timer update received:", data.remainingTime);
          setRemainingTime(data.remainingTime);
        });

        // Listen for exam ended
        socket.on("exam_ended", (data) => {
          console.log("Exam ended:", data.message);
          submitFinalResponse();
          setTimeUp(true);
        });
      } catch (error) {
        console.error("Error during socket connection:", error);
      }
    };

    socketConnect();

    // Cleanup function to remove listeners and disconnect the socket
    return () => {
      if (socketRef.current) {
        const socket = socketRef.current;
        socket.off("connect");
        socket.off("timer_update");
        socket.off("exam_ended");
        socket.disconnect();
        console.log("Socket disconnected and listeners removed");
      }
    };
  }, [examId, Duration]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !testSubmitted) {
        setFullscreenError(true); // Show overlay when user exits fullscreen mode
      }
    };

    if (!testSubmitted) {
      document.addEventListener("fullscreenchange", handleFullscreenChange);
    }

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [testSubmitted]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`/api/exams/questions/${examId}`);

        const formattedQuestions = response.data.map((q) => ({
          ...q,
          answered: false,
        }));
        console.log("formattedQuestions", formattedQuestions);

        dispatch(setQuestions(formattedQuestions));
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, [dispatch]);

  const handlePermissionGranted = () => {
    enableFullscreen();
  };
  const singleResponse = async (option, id) => {
    let url = `/api/exams/responses/${examId}`;
    let payload = {
      question_id: id,
      selected_option: option,
      response_status: "draft",
    };
    console.log("payload is ", payload);

    const response = await axios.put(url, payload);
    console.log("response single is ", response.data);
  };

  const handleOptionSelect = (option, id) => {
    dispatch(setSelectedOption({ index: currentQuestionIndex, option }));
    singleResponse(option, id);
    // socketRef.current.emit("submit_temp_response", {
    //   exam_id: examId,
    //   question_id: id,
    //   selected_option: option,
    // });
  };

  // useEffect(() => {
  //   window.history.pushState(null, null, window.location.href = `/exam/${examId}`);
  //   const preventBack = () => {
  //     window.history.pushState(null, null, window.location.href = `/exam/${examId}`);
  //   };
  //   window.addEventListener('popstate', preventBack);

  //   return () => {
  //     window.removeEventListener('popstate', preventBack);
  //   };
  // }, [navigate,examId]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      dispatch(visitQuestion(currentQuestionIndex + 1));
    }
    // console.log('option is ', option);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      dispatch(visitQuestion(currentQuestionIndex - 1));
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.error("Error exiting fullscreen:", err);
      });
    }
  };

  const handleSubmitTest = () => {
    setTestSubmitted(true);
    submitFinalResponse();
    dispatch(markSubmit(examId));
    navigate("/home", { replace: true });

    alert("Test submitted successfully!");
  };

  return (
    <div className="flex-1">
      {/* <Adm_Navbar /> */}
      <div className="flex h-screen bg-[#F5F6F8] ">
        <NoCopyComponent onPermissionGranted={handlePermissionGranted} />
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

        <div className="w-9/12 h-screen px-8 py-6 bg-[#F5F6F8]">
          <h1 className="text-xl font-bold text-gray-800 mb-4">
            General Knowledge
          </h1>
          <div className="bg-white p-6 rounded-xl shadow-lg h-5/6 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black">
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

            <div className="mt-56 flex justify-between">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-lg disabled:bg-gray-300"
                disabled={currentQuestionIndex === 0}
                onClick={handlePreviousQuestion}
              >
                Previous
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
        <Sidebar
          name={userName}
          onSubmitTest={handleSubmitTest}
          limit={timeUp}
        />
      </div>
    </div>
  );
};

export default MCQExamPage;
