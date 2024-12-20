import React from 'react';

const Question = ({ questionNumber, question, options, selectedOption, onSelectOption }) => {
  return (
    <div className="m-5 p-5 border border-gray-300 rounded-xl bg-white flex flex-col">
      <p className="font-medium mb-4 text-xl font-roboto">
        {questionNumber}. {question}
      </p>
      {options.map((option, index) => (
        <label key={index} className="font-light block mb-4 text-base font-roboto">
          <input
            type="radio"
            name={`option-${questionNumber}`}
            value={option}
            checked={selectedOption === option}
            onChange={() => onSelectOption(option)}
            className="mr-2"
          />
          {option}
        </label>
      ))}
    </div>
  );
};

export default Question;
