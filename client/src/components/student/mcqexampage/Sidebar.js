// Sidebar.js
import React from 'react';
import clockIcon from '../../../assets/sidebar/stopwatch.png';

const Sidebar = ({ userName, timeLeft, questionsStatus, onQuestionSelect }) => {
  return (
    <div className="p-4 bg-gray-100 rounded-lg w-1/4 h-auto m-2">
      <div className="flex justify-center items-center mb-4">
        <div className="bg-blue-200 text-black font-medium p-2 rounded text-center w-2/5">
          <img src={clockIcon} alt="Clock Icon" className="w-4 h-4 mr-1 inline align-middle" /> {timeLeft}
        </div>
      </div>
      <h3 className="mb-4 text-lg">Questions</h3>
      <div className="flex justify-between mb-4">
        <div className="flex items-center text-sm">
          <span className="w-4 h-4 rounded-md mr-2 bg-green-500"></span> Answered
        </div>
        <div className="flex items-center text-sm">
          <span className="w-4 h-4 rounded-md mr-2 bg-blue-800"></span> Visited
        </div>
        <div className="flex items-center text-sm">
          <span className="w-4 h-4 rounded-md mr-2 bg-gray-300"></span> Unanswered
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {questionsStatus.map((status, index) => (
          <div
            key={index}
            className={`w-full p-2 text-center font-bold rounded ${status?.status === 'answered' ? 'bg-green-500' : status?.status === 'visited' ? 'bg-blue-800' : 'bg-gray-300 text-gray-600'}`}
            onClick={() => onQuestionSelect(index)}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
