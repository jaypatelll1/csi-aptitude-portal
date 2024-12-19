// Question.js
import React from 'react';
import styles from '../../../styles/Student/Question.module.css';

const Question = ({ questionNumber, question, options, selectedOption, onSelectOption }) => {
  return (
    <div className={styles.questionContainer}>
      <p className={styles.questionText}>
        {questionNumber}. {question} 
      </p>
      {options.map((option, index) => (
        <label key={index} className={styles.optionLabel}>
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
