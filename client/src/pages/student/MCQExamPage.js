import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setOption } from '../../redux/optionsSlice';
import Question from '../../components/mcqexampage/Question';
import Sidebar from '../../components/mcqexampage/Sidebar';
import '../../styles/MCQExamPage.css';

const MCQExamPage = () => {
  const [questions, setQuestions] = useState([]);
  const selectedOptions = useSelector((state) => state.options.selectedOptions);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/questions');
        setQuestions(response.data);

        dispatch({ type: 'options/initializeOptions', payload: response.data.length });
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, [dispatch]);

  const handleOptionSelect = (option, questionIndex) => {
    dispatch(setOption({ questionIndex, option }));
  };

  return (
    <div className="exam-page">
      <Sidebar
        userName="Akshay Manjrekar"
        attempted={selectedOptions.filter(opt => opt !== null).length}
        remaining={questions.length - selectedOptions.filter(opt => opt !== null).length}
        timeLeft="00:19:69"
        questions={selectedOptions.map(option => (option ? 'answered' : 'unanswered'))}
      />
      <div className="questions-section">
        {questions.map((q, index) => (
          <Question
            key={index}
            questionNumber={index + 1}
            question={q.question}
            options={q.options}
            selectedOption={selectedOptions[index]}
            onSelectOption={(option) => handleOptionSelect(option, index)}
          />
        ))}
      </div>
    </div>
  );
};

export default MCQExamPage;
