import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/student/Mcqexampage/Sidebar";



const QuestionPage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get("https://dummyapicsi.onrender.com/api/questions");
        const formattedQuestions = response.data.map((q) => ({ ...q, answered: false }));
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
    <div className="flex h-screen ">
      <div className="p-6 w-9/12	">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-lg font-bold mb-4">Quiz</h1>
          {questions.length > 0 ? (
            <>
              <h2 className="text-xl font-semibold mb-4">
                {currentQuestionIndex + 1}. {questions[currentQuestionIndex].question}
              </h2>
              <div className="space-y-4">
                {questions[currentQuestionIndex].options.map((option, index) => (
                  <label
                    key={index}
                    className="block p-2 bg-gray-100 rounded-lg shadow hover:bg-gray-200 transition"
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestionIndex}`}
                      className="mr-2"
                      checked={
                        questions[currentQuestionIndex].selectedOption === option
                      }
                      onChange={() => handleOptionSelect(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </>
          ) : (
            <p>Loading question...</p>
          )}
          <div className="mt-6 flex justify-between items-center">
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={currentQuestionIndex === 0}
              onClick={() => handleVisitQuestion(currentQuestionIndex - 1)}
            >
              Previous
            </button>
            <span className="text-gray-600">00:19:69</span>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
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
