// Question.js
import React from 'react';
import '../../styles/Question.css';

const Question = ({ questionNumber, question, options, selectedOption, onSelectOption }) => {
  return (
    <div className="question-container">
      <p className="question-text">
        {questionNumber}. {question} 
      </p>
      {options.map((option, index) => (
        <label key={index} className="option-label">
          <input
            type="radio"
            name={`option-${questionNumber}`} 
            value={option}
            checked={selectedOption === option}
            onChange={() => onSelectOption(option)}
          />
          {option}
        </label>
      ))}
    </div>
  );
};

export default Question;
