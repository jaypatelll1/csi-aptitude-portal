import React from "react";

const Sup_LiveTestCard = ({ testData }) => {
  if (!testData || testData.length === 0) {
    return (
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Live Tests</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No live tests currently running</p>
        </div>
      </div>
    );
  }

  const renderTestCard = (test, index) => (
    <div key={index} className="border border-gray-200 rounded-lg p-6">
      {/* Header with Edit button and Created date */}
      <div className="flex justify-between items-start mb-4">
        <button className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
            <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25a1.75 1.75 0 01.445-.758L11.013 1.427z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          Edit test
        </button>
        <div className="text-right">
          <p className="text-xs text-gray-500">Created on : {test.createdDate}</p>
        </div>
      </div>

      {/* Test Title */}
      <h3 className="text-xl font-semibold text-gray-800 mb-4">{test.title}</h3>

      {/* Test Details */}
      <div className="flex items-center space-x-6 mb-4">
        <div className="flex items-center text-gray-600">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
            <path d="M8 1v6l4 2m-4-8a7 7 0 110 14 7 7 0 010-14z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm">{test.questions} Questions</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM8 4v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm">{test.duration}</span>
        </div>
      </div>

      {/* Branch and Year Info */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Branch:</span> {test.branch} &nbsp;&nbsp;
          <span className="font-medium">Year:</span> {test.year}
        </div>
        
        {/* Status Badge */}
        <div className="flex items-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            {test.status}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Live Tests</h2>
      
      {/* Grid Layout for Test Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.isArray(testData) 
          ? testData.map((test, index) => renderTestCard(test, index))
          : renderTestCard(testData, 0)
        }
      </div>
    </div>
  );
};

export default Sup_LiveTestCard;
