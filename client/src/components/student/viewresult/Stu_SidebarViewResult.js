import React from "react";

const Stu_SidebarViewResult = ({ 
  name = "Test", 
  questions, 
  currentIndex, 
  onQuestionClick, 
  totalMarks, 
  obtainedMarks, 
  isPassed, 
  userName 
}) => {
  // Calculate stats
  const correctCount = questions.filter(q => q.isCorrect).length;
  const incorrectCount = questions.filter(q => q.isIncorrect).length;
  const unansweredCount = questions.filter(q => q.selectedOption === null).length;
  const total = questions.length;

  return (
    <div className="flex items-center justify-center">
      <div className="w-[372px] h-[824px] p-4 bg-white shadow-lg rounded-lg">
        <div className="mb-6">
          <h1 className="text-xl font-semibold mb-2">{name}</h1>
          <div className="flex justify-between items-center">
            <p className="text-gray-700">{userName}</p>
            <span className={`px-3 py-1 rounded-full text-sm ${isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isPassed ? "Passed" : "Failed"}
            </span>
          </div>
          <div className="flex justify-evenly mt-2">
            <div className="px-8 py-2 flex flex-row border border-[#07C31D] mr-5 rounded-md text-black">
              <h2 className="font-medium">Correct :</h2>
              <p className="font-bold">
                {correctCount}/{total}
              </p>
            </div>
            <div className="px-4 py-2 flex flex-row border border-[#C82F2F] rounded-md text-black">
              <h2 className="font-medium">Incorrect :</h2>
              <p className="font-bold">{incorrectCount}</p>
            </div>
          </div>
        </div>

        <hr className="border-gray-300 mb-6" />

        <div className="flex flex-row w-[301px] justify-center ml-5 px-8 py-2 border border-[#1349C5] rounded-md text-black">
          <h2 className="font-medium">Progress:</h2>
          <p className="font-bold">
            {correctCount + incorrectCount}/{total}
          </p>
        </div>

        <h2 className="text-lg font-bold ml-5 mt-5 mb-4">Questions</h2>

        <div className="flex justify-around text-sm mb-6">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#07C31D] rounded-md mr-2"></div>
            Correct
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#1B2E58] rounded-md mr-2"></div>
            Visited
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#C82F2F] rounded-md mr-2"></div>
            Incorrect
          </div>
        </div>

        <div className="grid grid-cols-5 mb-8 gap-y-2 place-items-center">
          {questions.map((question, index) => {
            let bgColor = "bg-[#F1F4F8]"; // Unanswered (white)
            let text = "text-black";

            if (question.isCorrect) {
              bgColor = "bg-[#07C31D]"; // Green for correct
              text = "text-white";
            } else if (question.isIncorrect) {
              bgColor = "bg-[#C82F2F]"; // Red for incorrect
              text = "text-white";
            } else if (index === currentIndex) {
              bgColor = "bg-[#1B2E58]"; // Current (blue)
              text = "text-white";
            }

            return (
              <button
                key={question.question_id}
                className={`${bgColor} ${text} font-semibold py-2 w-14 h-9 rounded-lg hover:opacity-80 transition`}
                onClick={() => onQuestionClick(index)}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="font-semibold">Marks: {obtainedMarks}/{totalMarks}</p>
          <p>Total questions: {total}</p>
          <p>No. of answered questions: {correctCount + incorrectCount}</p>
          <p>No. of unanswered questions: {unansweredCount}</p>
        </div>
      </div>
    </div>
  );
};

export default Stu_SidebarViewResult;