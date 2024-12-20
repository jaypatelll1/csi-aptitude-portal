import React from 'react';

const Stu_TestCard = ({ testName, questionCount, duration, lastDate, status }) => {
  return (
    <div className="border rounded-lg shadow-md p-3 max-w-lg">
      <div className="flex justify-between items-center mb-4">
        
        <span className="text-sm text-gray-500">Last date: {lastDate}</span>
      </div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{testName}</h2>
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <div className="flex items-center mr-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-4 h-4 mr-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 6.75h7.5m-7.5 4.5h7.5m-7.5 4.5h7.5m-10.5-9h.008v.008H5.25v-.008h.008zm0 4.5h.008v.008H5.25v-.008h.008zm0 4.5h.008v.008H5.25v-.008h.008z"
            />
          </svg>
          {questionCount} Questions
        </div>
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-4 h-4 mr-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6l3 3m-7.5-9h10.5c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125H4.125C3.504 18 3 17.496 3 16.875v-9.75C3 6.504 3.504 6 4.125 6H8.25"
            />
          </svg>
          {duration}
        </div>
      </div>
      <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
        Start Test
      </button>
    </div>
  );
};

export default Stu_TestCard;
