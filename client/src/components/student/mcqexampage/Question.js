import React from 'react';

const Question = ({ 
  questionNumber, 
  question, 
  questionType,
  options, 
  selectedOption, 
  selectedOptions,
  textAnswer,
  imageUrl,
  onSelectOption, 
  onSelectMultipleOptions,
  onTextChange
}) => {
  // Render different input types based on questionType
  const renderQuestionInput = () => {
    switch(questionType) {
      case 'single_choice':
        return (
          <div className="mt-4">
            {options.map((option, index) => (
              <div key={index} className="mb-3">
                <label className="flex items-start cursor-pointer">
                  <div className="flex items-center h-5">
                    <input
                      type="radio"
                      name={`option-${questionNumber}`}
                      value={option}
                      checked={selectedOption === option}
                      onChange={() => onSelectOption(option)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded-full focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 text-base font-light text-gray-700">
                    {option}
                  </div>
                </label>
              </div>
            ))}
          </div>
        );
      
      case 'multiple_choice':
        return (
          <div className="mt-4">
            {options.map((option, index) => (
              <div key={index} className="mb-3">
                <label className="flex items-start cursor-pointer">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      name={`option-${questionNumber}-${index}`}
                      value={option}
                      checked={selectedOptions?.includes(option)}
                      onChange={() => {
                        if (selectedOptions?.includes(option)) {
                          onSelectMultipleOptions(selectedOptions.filter(item => item !== option));
                        } else {
                          onSelectMultipleOptions([...(selectedOptions || []), option]);
                        }
                      }}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 text-base font-light text-gray-700">
                    {option}
                  </div>
                </label>
              </div>
            ))}
          </div>
        );
      
      case 'text':
        return (
          <div className="mt-4">
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md"
              rows="4"
              value={textAnswer || ''}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Type your answer here..."
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-800">
            {questionNumber}. {question}
          </h3>
        </div>
        {/* Example of incorporating the flag icon shown in your UI */}
        <div className="flex items-center">
          <button className="ml-2 text-gray-500 hover:text-blue-600 p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Display image if provided */}
      {imageUrl && (
        <div className="mb-4">
          <img 
            src={imageUrl} 
            alt={`Image for question ${questionNumber}`} 
            className="max-w-full h-auto rounded-md"
          />
        </div>
      )}
      
      {renderQuestionInput()}
    </div>
  );
};

export default Question;