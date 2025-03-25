import React from "react";

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
  onTextChange,
}) => {
  console.log("selectedOptions:", selectedOption, "Type:", typeof selectedOption);

  const renderQuestionInput = () => {

    
    switch (questionType) {
      case "single_choice":
        return (
          <div className="mt-4 space-y-3">
         {Object.entries(options).map(([key, value], index) => (
              <label
                key={index}
                className="flex items-center p-3  rounded-lg cursor-pointer hover:bg-gray-100"
              >
                <input
                  type="radio"
                  name={`question-${questionNumber}`}
                  value={key}
                  checked={key === selectedOption}
                  onChange={() => onSelectOption(key)}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700 text-base">{value}</span>
              </label>
            ))}
          </div>
        );

      case "multiple_choice":
        return (
          <div className="mt-4 space-y-3">
            {Object.entries(options).map(([key, value], index) => ( 
              <label
                key={index}
                className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  name={`option-${questionNumber}-${index}`}
                  value={key}
                  checked={selectedOptions?.includes(key)}
                  onChange={() => {
                    if (Array.isArray(selectedOptions) && selectedOptions.includes(key)) { // FIXED
                      onSelectMultipleOptions(selectedOptions.filter((item) => item !== key)); // FIXED
                    } else {
                      onSelectMultipleOptions([...(Array.isArray(selectedOptions) ? selectedOptions : []), key]); // FIXED
                    }
                  }}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700 text-base">{value}</span>
              </label>
            ))}
          </div>
        );

      case "text":
        return (
          <div className="mt-4">
            <textarea
              className="w-full min-h-[250px] p-3 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
              rows="4"
              value={textAnswer || ""}
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
    <div className="bg-white rounded-lg p-6 ">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {questionNumber}. {question}
        </h3>
      </div>

      {imageUrl && (
        <div className="mb-4">
          <img
            src={imageUrl}
            alt={`Image for question ${questionNumber}`}
            className="w-full max-w-lg h-auto rounded-md"
          />
        </div>
      )}

      {renderQuestionInput()}
    </div>
  );
};

export default Question;
