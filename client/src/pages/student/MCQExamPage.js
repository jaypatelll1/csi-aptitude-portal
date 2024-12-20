import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setOption, markVisited, initializeOptions } from '../../redux/optionsSlice';

const MCQExamPage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const selectedOptions = useSelector((state) => state.options.selectedOptions || []);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('https://dummyapicsi.onrender.com/api/questions');
        setQuestions(response.data);
        dispatch(initializeOptions(response.data.length));
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, [dispatch]);

  const handleOptionSelect = (option) => {
    dispatch(setOption({ questionIndex: currentQuestionIndex, option }));
  };

  const handleQuestionVisit = (index) => {
    setCurrentQuestionIndex(index);
    dispatch(markVisited(index));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      handleQuestionVisit(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      handleQuestionVisit(currentQuestionIndex - 1);
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen p-4">
      {/* Main content on the left */}
      <main className="w-3/4 bg-white p-6 rounded-lg shadow-md mr-6">
        {questions.length > 0 && (
          <div className="flex flex-col space-y-4">
            <div className="text-xl font-semibold mb-4">
              Question {currentQuestionIndex + 1}
            </div>
            <div className="text-lg mb-2">
              {questions[currentQuestionIndex].question}
            </div>
            <div className="flex flex-col space-y-2">
              {questions[currentQuestionIndex].options.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 p-2 bg-gray-100 rounded-lg shadow hover:bg-gray-200 transition">
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    className="w-4 h-4"
                    checked={selectedOptions[currentQuestionIndex]?.option === option}
                    onChange={() => handleOptionSelect(option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Sidebar on the right */}
      <aside className="w-1/5 bg-white p-3 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <div className="bg-blue-600 text-white font-bold text-lg w-10 h-10 flex items-center justify-center rounded-full mr-3">
            AM
          </div>
          <div>
            <p className="text-lg font-semibold">Akshay Manjrekar</p>
            <p className="text-sm">
              Attempted: {selectedOptions?.filter((opt) => opt?.option !== null).length || 0}
            </p>
            <p className="text-sm">
              Remaining: {questions.length - (selectedOptions?.filter((opt) => opt?.option !== null).length || 0)}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              className={`p-1 text-sm rounded ${
                selectedOptions?.[index]?.option !== null
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              } ${index === currentQuestionIndex ? 'border-2 border-blue-500' : ''}`}
              onClick={() => handleQuestionVisit(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default MCQExamPage;
