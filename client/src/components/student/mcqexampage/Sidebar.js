import React ,{useEffect} from "react";
import { useSelector, useDispatch } from "react-redux";
import { visitQuestion } from "../../../redux/questionSlice";

const Sidebar = ({ name , onSubmitTest , limit }) => {
  const dispatch = useDispatch();
  
  const { questions, currentQuestionIndex } = useSelector(
    (state) => state.questions
  );

  let attemptedCount = questions.filter((q) => q.answered).length;
  let visitedCount = questions.filter((q) => q.visited).length;
  const total = questions.length;
  const remaining = total - attemptedCount;

  // Auto-submit when the limit is reached
  useEffect(() => {
    if (limit) {
      onSubmitTest();
    }
  }, [limit, onSubmitTest]);

  return (
    <div className="w-3/12 flex items-center justify-center">
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
            let bgColor = "bg-[#F1F4F8]";
            let text = "text-black";

            if (question.answered) {
              bgColor = "bg-[#4D71C3]";
              text = "text-white";
            } else if (index === currentQuestionIndex) {
              bgColor = "bg-[#1B2E58]";
              text = "text-white";
            } else if (!question.answered && question.visited) {
              bgColor = "bg-[#1B2E58]";
              text = "text-white";
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

        <button
          className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
          onClick={() => { if (visitedCount === total) onSubmitTest(); }}

          disabled={ visitedCount !== total}
        >
          Submit Test
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
