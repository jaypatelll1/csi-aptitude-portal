import React, { useState } from 'react';

const InputQuestions = () => {
  const [question, setQuestion] = useState('');
  const [answerType, setAnswerType] = useState('single');
  const [answers, setAnswers] = useState(['', '', '', '']);
  const [toggles, setToggles] = useState([false, false, false, false]);
  const [hoverIndex, setHoverIndex] = useState(null); // Track hovered index

  const handleAddAnswer = () => {
    if (answers.length < 4) { // Limit answers to 4
      setAnswers([...answers, '']);
      setToggles([...toggles, false]);
    }
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleRemoveAnswer = (index) => {
    const newAnswers = answers.filter((_, i) => i !== index);
    const newToggles = toggles.filter((_, i) => i !== index);
    setAnswers(newAnswers);
    setToggles(newToggles);
  };

  const handleToggleChange = (index) => {
    const newToggles = [...toggles];
    if (answerType === 'single') {
      newToggles.fill(false); // Disable all toggles if Single Choice
      newToggles[index] = true;
    } else {
      newToggles[index] = !newToggles[index]; // Toggle for Multiple Choice
    }
    setToggles(newToggles);
  };

  const handleSubmit = () => {
    if (question && answers.every(answer => answer.trim() !== '')) {
      console.log({ question, answerType, answers, toggles });
    } else {
      alert("Please fill in all fields before submitting.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg font-sans">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Aptitude Test</h1>

      <div className="bg-blue-50 p-6 rounded-lg shadow-md mb-6">
        <div className="mb-4">
          <label htmlFor="question" className="block text-gray-700 font-medium mb-2">Enter Question:</label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter question description..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="answer-type" className="block text-gray-700 font-medium mb-2">Answer Type:</label>
          <select
            id="answer-type"
            value={answerType}
            onChange={(e) => setAnswerType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="single">Single Choice</option>
            <option value="multiple">Multiple Choice</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Answers:</label>
          {answers.map((answer, index) => (
            <div
              key={index}
              className="group flex items-center gap-4 mb-4 p-3 border border-gray-300 rounded-lg bg-gray-50 hover:shadow-md"
              onMouseEnter={() => setHoverIndex(index)} // Track hover
              onMouseLeave={() => setHoverIndex(null)} // Reset hover
            >
              <input
                type="text"
                value={answer}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                placeholder={`Enter option ${index + 1}`}
                className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={() => handleRemoveAnswer(index)}
                className="text-red-500 hover:text-red-700"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 21C6.45 21 5.97933 20.8043 5.588 20.413C5.19667 20.0217 5.00067 19.5507 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8043 20.021 18.413 20.413C18.0217 20.805 17.5507 21.0007 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z"
                    fill="currentColor"
                  />
                </svg>
              </button>

              {/* Show the toggle button */}
              <div className="relative inline-block w-10 align-middle select-none">
                <input
                  type="checkbox"
                  checked={toggles[index]}
                  onChange={() => handleToggleChange(index)}
                  className={`absolute block w-6 h-6 bg-${toggles[index] ? 'green' : 'gray'}-500 border-4 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 checked:right-0`}
                />
                <span className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></span>

                {/* Show toggle if it's checked or if hovering over this option */}
                {(toggles[index] || hoverIndex === index) && (
                  <div className="absolute right-0">
                    {/* Display the toggle */}
                  </div>
                )}
              </div>
            </div>
          ))}

          {answers.length < 4 && (
            <button
              onClick={handleAddAnswer}
              className="text-blue-500 hover:underline mt-2"
            >
              + Add Answer
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 justify-between">
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Save and Add Next
        </button>
        <button className="bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default InputQuestions;
