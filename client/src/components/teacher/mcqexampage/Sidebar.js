import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { visitQuestion } from "../../../redux/questionSlice";

const Sidebar = ({ name, onSubmitTest }) => {
  const dispatch = useDispatch();
  const { questions, currentQuestionIndex } = useSelector((state) => state.questions);

  let attemptedCount = questions.filter((q) => q.answered === true).length;
  let visitedCount = questions.filter((q) => q.visited === true).length;
  const total = questions.length;
  const remaining = total - attemptedCount;

  return (
    <div className="w-4/12 2xl:w-3/12 flex items-center justify-center mr-5">
      <div className="w-96 p-4 bg-white shadow-lg rounded-lg">
        <div className="mb-6">
          <h1 className="text-xl font-semibold mb-2">{name}</h1>
          <div className="flex items-center text-center">
            <div className="px-8 py-2 flex flex-row border border-[#1349C5] mr-5 rounded-md text-black">
              <h2 className="font-medium">Attempted:</h2>
              <p className="font-bold">
                {attemptedCount}/{total}
              </p>
            </div>
            <div className="px-4 py-2 flex flex-row border border-[#1349C5] rounded-md text-black">
              <h2 className="font-medium">Remaining:</h2>
              <p className="font-bold">{remaining}</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-300 mb-6" />

        {/* Question Status */}
        <h2 className="text-lg font-bold mb-4">Questions</h2>

        <div className="flex justify-around text-sm mb-6">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#4D71C3] rounded-md mr-1"></div>
            Answered
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#8A2BE2] rounded-md mr-1"></div>
            Review
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#1B2E58] rounded-md mr-1"></div>
            Visited
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#F1F4F8] rounded-md mr-1"></div>
            Unanswered
          </div>
        </div>

        <div className="grid grid-cols-5 mb-8 gap-y-2 place-items-center">
          {questions.map((question, index) => {
            let bgColor = "bg-[#F1F4F8]"; // Default: Unanswered
            let textColor = "text-black";

            if (question.markedForReview) {
              bgColor = "bg-purple-500"; // Marked for Review
              textColor = "text-white";
            } else if (question.answered) {
              bgColor = "bg-[#4D71C3]"; // Answered
              textColor = "text-white";
            } else if (question.visited && !question.answered) {
              bgColor = "bg-[#1B2E58]"; // Visited (not answered)
              textColor = "text-white";
            } else if (index === currentQuestionIndex) {
              bgColor = "bg-[#1B2E58]"; // Current Question
              textColor = "text-white";
            }

            return (
              <button
                key={index}
                className={`${bgColor} ${textColor} font-semibold py-2 w-16 h-10 rounded-lg 
                  hover:opacity-80 transition duration-300 ease-in-out 
                  focus:outline-none focus:ring-2 focus:ring-blue-500`}
                onClick={() => dispatch(visitQuestion(index))}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <button
          className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg 
            hover:bg-green-600 transition duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-green-700
            disabled:bg-green-300 disabled:cursor-not-allowed"
          onClick={() => {
            if (visitedCount === total || attemptedCount !== total) onSubmitTest();
          }}
          disabled={visitedCount !== total}
        >
          Submit Test
        </button>
      </div>
    </div>
  );
};

export default Sidebar;