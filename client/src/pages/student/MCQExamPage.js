import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setOption, markVisited, initializeOptions } from '../../redux/optionsSlice';
import Question from '../../components/mcqexampage/Question';
import Sidebar from '../../components/mcqexampage/Sidebar';
import '../../styles/MCQExamPage.css';

const MCQExamPage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const selectedOptions = useSelector((state) => state.options.selectedOptions);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('/api/questions');
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
    <div className="exam-page">
      <Sidebar
        userName="Akshay Manjrekar"
        timeLeft="00:19:69"
        questionsStatus={selectedOptions}
        onQuestionSelect={handleQuestionVisit}
      />
      <div className="questions-section">
        {questions.length > 0 && (
          <Question
            questionNumber={currentQuestionIndex + 1}
            question={questions[currentQuestionIndex].question}
            options={questions[currentQuestionIndex].options}
            selectedOption={selectedOptions[currentQuestionIndex]?.option}
            onSelectOption={handleOptionSelect}
          />
        )}
        <div className="navigation-buttons">
          <button 
            className="prev-button" 
            onClick={handlePreviousQuestion} 
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </button>
          <button 
            className="next-button" 
            onClick={handleNextQuestion} 
            disabled={currentQuestionIndex === questions.length - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default MCQExamPage;
