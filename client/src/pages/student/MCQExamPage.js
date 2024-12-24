// MCQExamPage.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
<<<<<<< HEAD
import Sidebar from "../../components/student/Mcqexampage/Sidebar";
import {
  setQuestions,
  setSelectedOption,
  visitQuestion,
} from "../../redux/questionSlice";
=======
import Sidebar from "../../components/student/mcqexampage/Sidebar";
>>>>>>> 8405c6858a5b6eb3989947755080cce6f1715c45


const MCQExamPage = () => {
  const dispatch = useDispatch();
  const { questions, currentQuestionIndex } = useSelector(
    (state) => state.questions
  );

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

  return (
    <div className="flex h-screen bg-[#F5F6F8]">
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

      <Sidebar />
    </div>
  );
};

export default MCQExamPage;
