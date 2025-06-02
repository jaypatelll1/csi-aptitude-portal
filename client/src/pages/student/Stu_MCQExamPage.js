import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import { clearExamId } from "../../redux/ExamSlice";
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
  const [fullscreenError, setFullscreenError] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  
  const examId = location.state?.examId;
  const Duration = location.state?.Duration;

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

  const handleSubmitTest = async () => {
    setTestSubmitted(true);
    await submitFinalResponse();
    socketRef.current?.emit("submit_responses");
    dispatch(clearExamId(examId));
    dispatch(clearQuestions());
    alert("Test submitted successfully!");
    navigate("/home", { replace: true });
  };

  // Socket connection and timer management for exam end detection
  useEffect(() => {
    const socketConnect = async () => {
      if (!socketRef.current && examId && Duration) {
        const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
        socketRef.current = io(`${API_BASE_URL}/exams/start-exam`, {
          withCredentials: true,
        });

        const socket = socketRef.current;
        
        socket.on("exam_ended", () => {
          submitFinalResponse();
          setTimeUp(true);
        });
      }
    };
    
    socketConnect();

    return () => {
      if (socketRef.current) {
        socketRef.current.off("exam_ended");
        socketRef.current.disconnect();
      }
    };
  }, [examId, Duration]);

  // Handle time up
  useEffect(() => {
    if (timeUp) handleSubmitTest();
  }, [timeUp]);

  // Fullscreen change handler
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

  return (
    <div className="relative flex-1">
      {/* Main Content */}
      <div className="flex h-screen bg-[#F5F6F8]">
        <NoCopyComponent onPermissionGranted={enableFullscreen} />
        {fullscreenError && !testSubmitted && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
              <h2 className="text-lg font-semibold mb-4 text-red-500">Fullscreen Mode Required</h2>
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

        {/* Pass socketRef to Question component */}
        <Question socketRef={socketRef} />
        
        <Sidebar name={userName} onSubmitTest={handleSubmitTest} />
      </div>
    </div>
  );
};

export default Stu_MCQExamPage;