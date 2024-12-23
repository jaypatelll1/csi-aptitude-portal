import React from "react";

const Adm_PastTestCard = ({ test }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-200 flex flex-col">
      {/* Card Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="bg-gray-300 text-gray-800 text-sm px-2 py-1 rounded font-sans">
          Past test
        </span>
        <span className="text-gray-500 text-sm font-sans">Conducted on: {test.date}</span>
      </div>

      {/* Test Info */}
      <h2 className="text-lg font-bold text-gray-900 font-sans">{test.title}</h2>
      <div className="text-gray-600 text-sm mt-4 font-sans">
        <p>📄 {test.questions} Questions</p>
        <p>⏱ {test.duration}</p>
      </div>

      {/* Buttons */}
      <div className="flex justify-end mt-4 space-x-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 border border-blue-300 opacity-80 hover:opacity-100">
          View Results
        </button>
        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 border border-gray-400 opacity-80 hover:opacity-100">
          Archive
        </button>

      </div>
    </div>
  );
};

export default Adm_PastTestCard;
