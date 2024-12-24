import React from "react";

const Sidebar = ({ attempted, total, currentQuestionIndex, questions, onVisitQuestion }) => {
  return (
    <div className="w-3/12 bg-gray-50 p-4 m-5 shadow-md rounded-lg">
      <div className="flex flex-col items-center mb-6 ">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-lg font-bold">
          AM
        </div>
        <h2 className="text-lg font-semibold mt-4">Akshay Manjrekar</h2>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center px-3 py-1.5 bg-white border rounded-lg shadow-sm">
            <span>Attempted:</span>
            <span className="text-blue-600 font-semibold">{attempted}/{total}</span>
          </div>
          <div className="flex justify-between items-center px-3 py-1.5 bg-white border rounded-lg shadow-sm">
            <span>Remaining:</span>
            <span className="text-blue-600 font-semibold">{total - attempted}</span>
          </div>
        </div>
      </div>

      <hr className="border-gray-300 my-6" />

      {/* Questions Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Questions</h3>
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-[#4D71C3] rounded"></div>
            <span className="text-sm">Answered</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-[#1B2E58] rounded"></div>
            <span className="text-sm">Visited</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-[#F1F4F8] rounded"></div>
            <span className="text-sm">Unanswered</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {questions.map((question, index) => {
            const isAnswered = question.answered;
            const isVisited = index === currentQuestionIndex;
            const bgColor = isAnswered
              ? "bg-[#4D71C3]"
              : isVisited
              ? "bg-[#1B2E58]"
              : "bg-[#F1F4F8]";

            return (
              <button
                key={index}
                className={`w-16 h-10 ${bgColor} text-white font-semibold rounded`} // Updated width
                onClick={() => onVisitQuestion(index)}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Next Button */}
      <div className="mt-6">
        <button className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
          Next
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
