import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { visitQuestion } from "../../../redux/questionSlice";

const Sidebar = ({ name = "Akshay Manjrekar" }) => {
  const dispatch = useDispatch();
  const { questions, currentQuestionIndex } = useSelector(
    (state) => state.questions
  );

  const attemptedCount = questions.filter((q) => q.answered).length;
  const total = questions.length;
  const remaining = total - attemptedCount;

  return (
    <div className="w-3/12 flex items-center justify-center">
      <div className="w-96 p-4 bg-white shadow-lg rounded-lg">
        <div className="mb-6">
          <h1 className="text-xl font-semibold mb-2">{name}</h1>
          <div className="flex items-center text-center">
            <div className="px-8 py-2 flex flex-row border mr-5 rounded-md text-blue-600">
              <h2 className="font-medium">Attempted:</h2>
              <p className="font-bold">
                {attemptedCount}/{total}
              </p>
            </div>
            <div className="px-4 py-2 flex flex-row border rounded-md text-blue-600">
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
            <div className="w-4 h-4 bg-[#4D71C3] rounded-md mr-2"></div>
            Answered
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#1B2E58] rounded-md mr-2"></div>
            Visited
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#F1F4F8] rounded-md mr-2"></div>
            Unanswered
          </div>
        </div>

        <div className="grid grid-cols-5 mb-8 gap-y-2 place-items-center">
          {questions.map((question, index) => {
            // Determine button color
            let bgColor = "bg-[#F1F4F8]"; // Default: Unanswered
            let text = "text-black";

            if (question.answered) {
              bgColor = "bg-[#4D71C3]";
              text = "text-white"; // Answered
            } else if (index === currentQuestionIndex) {
              bgColor = "bg-[#1B2E58]";
              text = "text-white"; // Current question
            } else if (!question.answered && question.visited) {
              bgColor = "bg-[#1B2E58]";
              text = "text-white"; // Visited but not answered
            }

            return (
              <button
                key={index}
                className={`${bgColor} ${text} font-semibold py-2 w-16 h-10 rounded-lg hover:opacity-80 transition`}
                onClick={() => {
                  dispatch(visitQuestion(index));
                }}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <button className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition">
          Submit Test
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
