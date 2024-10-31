// MCQExamPage.js
import React, { useState } from 'react';
import Question from '../../components/mcqexampage/Question';
import Sidebar from '../../components/mcqexampage/Sidebar';
import '../../styles/MCQExamPage.css';

const questions = [
  {
    question: "What is React.js and which domain is it used in?",
    options: [
      "Library, Web Dev",
      "Software, UI/UX",
      "Library, AI",
      "Framework, App Dev"
    ]
  },
  // Add more questions as needed
];

const MCQExamPage = () => {
  // Initialize selectedOption as an array of null values with length equal to the number of questions
  const [selectedOptions, setSelectedOptions] = useState(Array(questions.length).fill(null));

  // Function to handle selection of each question's option individually
  const handleOptionSelect = (option, questionIndex) => {
    const updatedOptions = [...selectedOptions];
    updatedOptions[questionIndex] = option;
    setSelectedOptions(updatedOptions);
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
