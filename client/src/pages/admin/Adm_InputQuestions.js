import React, { useState } from 'react'; 
import Adm_Sidebar from "../../components/Admin/Adm_Sidebar";

const InputQuestions = () => {
  const [question, setQuestion] = useState('');
  const [answerType, setAnswerType] = useState('single');
  const [answers, setAnswers] = useState(['', '', '', '']);
  const [toggles, setToggles] = useState([false, false, false, false]);

  const handleAddAnswer = () => {
    if (answers.length < 4) {
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
      newToggles.fill(false);
      newToggles[index] = true;
    } else {
      newToggles[index] = !newToggles[index];
    }
    setToggles(newToggles);
  };

  const handleSubmit = () => {
    if (question && answers.every(answer => answer.trim() !== '')) {
      console.log({ question, answerType, answers, toggles });
    } else {
      alert('Please fill in all fields before submitting.');
    }
  };

  return (
    <div className="flex h-screen m-0 p-0 w-full">
      {/* Sidebar Section */}
      <div className="w-1/6 bg-gray-100 p-0 m-0">
        <Adm_Sidebar />
      </div>

      {/* Main Content Section */}
      <div className="flex-grow w-5/6 p-9 bg-gray-100 overflow-y-auto m-0">
        {/* Title Section */}
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">Create Aptitude Test</h1>

        {/* Navigation Section */}
        <div className="flex justify-between items-center mb-6">
          <button className=" text-xl text-blue-500 hover:underline flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            View Questions
          </button>
          <span className="text-xl text-gray-500 font-medium">Question 1/30</span>
        </div>

        {/* Main Form Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="mb-4">
            <label htmlFor="question" className="text-xl block text-gray-700 font-medium mb-2">Enter Question:</label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter question description..."
              className="w-full p-4 h-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="answer-type" className="text-xl block text-gray-700 font-medium mb-2">Answer Type:</label>
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
            <label className="text-xl block text-gray-700 font-medium mb-2">Answers:</label>
            {answers.map((answer, index) => (
              <div key={index} className="group flex items-center gap-4 mb-4 p-3 border border-gray-300 rounded-lg bg-gray-50 hover:shadow-md">
                {/* Input Box */}
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder={`Enter option ${index + 1}`}
                  className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Toggle Button */}
                <button
                  onClick={() => handleToggleChange(index)}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${toggles[index] ? 'bg-[#449800]' : 'bg-gray-300'}`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 transform ${toggles[index] ? 'translate-x-6' : 'translate-x-0'}`}
                  />
                </button>

                {/* Remove Button */}
                <button onClick={() => handleRemoveAnswer(index)} className="text-red-500 hover:text-red-700 ml-2">
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
              </div>
            ))}

            {answers.length < 4 && (
              <button
                onClick={handleAddAnswer}
                className="bg-white text-black px-4 py-2 rounded-lg mt-2 hover:border border-grey-100 transition-all duration-300"
              >
                + Add Answer
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-4 justify-between">
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          >
            Save and Add Next
          </button>
          <button className="bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputQuestions;
