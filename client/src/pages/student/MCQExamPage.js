import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/student/mcqexampage/Sidebar";

const QuestionPage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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
        setQuestions(formattedQuestions);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, []);

  const handleOptionSelect = (option) => {
    const updatedQuestions = questions.map((q, index) =>
      index === currentQuestionIndex
        ? { ...q, answered: true, selectedOption: option }
        : q
    );
    setQuestions(updatedQuestions);
  };

  const handleVisitQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      handleVisitQuestion(currentQuestionIndex + 1);
    }
  };

  const attemptedCount = questions.filter((q) => q.answered).length;

  return (
    <div className="flex h-screen">
      <div className="w-9/12 px-8 py-6 bg-gray-100">
      <h1 className="text-xl font-bold text-gray-800 mb-4">
            General Knowledge
          </h1>
        <div className=" bg-white p-6 rounded-xl shadow-lg h-5/6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-600">
              {currentQuestionIndex + 1}.{" "}
              {questions[currentQuestionIndex]?.question || "Loading..."}
            </h2>
            <span className=" font-sans text-center text-sm flex items-center border-2 p-1 border-blue-500 rounded-md">
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
              onClick={() => handleVisitQuestion(currentQuestionIndex - 1)}
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
        attempted={attemptedCount}
        total={questions.length}
        currentQuestionIndex={currentQuestionIndex}
        questions={questions}
        onVisitQuestion={handleVisitQuestion}
      />
    </div>
  );
};

export default QuestionPage; 