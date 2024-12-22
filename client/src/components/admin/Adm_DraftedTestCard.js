import React from "react";

const Adm_DraftedTestCard = ({ test }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-200 flex flex-col">
      {/* Card Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded">
          📝 Draft test
        </span>
        <span className="text-gray-500 text-sm">Created on: {test.date}</span>
      </div>

      {/* Test Info */}
      <h2 className="text-lg font-bold text-gray-900">{test.title}</h2>
      <div className="text-gray-600 text-sm mt-2">
        <p>📄 {test.questions} Questions</p>
        <p>⏱ {test.duration}</p>
      </div>

      {/* Buttons */}
      <div className="flex mt-4 space-x-2">
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Publish
        </button>
        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
          Schedule
        </button>
      </div>
    </div>
  );
};

export default Adm_DraftedTestCard;
