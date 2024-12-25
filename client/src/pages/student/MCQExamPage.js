import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import Sidebar from "../../components/student/mcqexampage/Sidebar";
import {
  setQuestions,
  setSelectedOption,
  visitQuestion,
} from "../../redux/questionSlice";
import NoCopyComponent from "../../components/student/mcqexampage/NoCopyComponent";

const MCQExamPage = () => {
  const dispatch = useDispatch();
  const { questions, currentQuestionIndex } = useSelector(
    (state) => state.questions
  );
  const [fullscreenError, setFullscreenError] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);

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
        const response = await axios.get(
          "https://dummyapicsi.onrender.com/api/questions"
        );
        const formattedQuestions = response.data.map((q) => ({
          ...q,
          answered: false,
        }));
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

  const handleOptionSelect = (option) => {
    dispatch(
      setSelectedOption({
        index: currentQuestionIndex,
        option,
      })
    );
  };

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

 

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.error("Error exiting fullscreen:", err);
      });
    }
  };
  
  const handleSubmitTest = () => {
    setTestSubmitted(true);
  };

  return (
    <div className="flex h-screen bg-[#F5F6F8]">
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
              {questions[currentQuestionIndex]?.question || "Loading..."}
            </h2>
            <span className="font-sans text-center text-sm flex items-center border-2 p-1 border-blue-500 rounded-md">
              00:19:69
            </span>
          </div>

          <div className="space-y-4">
            {questions[currentQuestionIndex]?.options.map((option, index) => (
              <label
                key={index}
                className="block p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  className="mr-2"
                  checked={
                    questions[currentQuestionIndex]?.selectedOption === option
                  }
                  onChange={() => handleOptionSelect(option)}
                />
                {option}
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
      <Sidebar name="Akshay Manjrekar" onSubmitTest={handleSubmitTest} /> 
         </div>
  );
};

export default MCQExamPage;
