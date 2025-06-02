import React from "react";
import { useSelector } from "react-redux";

const Stu_SidebarViewResult = ({
  questions = [],
  currentIndex = 0,
  onQuestionClick,

  name = "Test",
}) => {
  // Get user data from Redux store
  const user = useSelector((state) => state.user.user);
  const userName = user ? user.name : "Student";

  // Process questions to match the expected format for this component
  // Handle text, single answer, and multiple answer questions
  const processedQuestions = questions.map((question) => {
    // For text type questions
    if (question.questionType === "text") {
      // For text questions, isCorrect comes from backend
      // isUnanswered is determined by whether there's any text response
      const isUnanswered = !question.textResponse || question.textResponse.trim() === "";

      return {
        question_id: question.question_id || question.questionId,
        isCorrect: !isUnanswered && question.isCorrect,
        isIncorrect: !isUnanswered && !question.isCorrect,
        isUnanswered: isUnanswered,
        category: question.category || "TEST",
        isMultipleAnswer: false,
        isTextQuestion: true,
      };
    } else if (question.isMultipleAnswer) {
      // For multiple answer questions
      const selectedOptions = question.selectedOptions || [];
      const correctAnswers = question.correctAnswers || [];

      // A question is correct if all correct answers are selected and no incorrect answers are selected
      const allCorrectAnswersSelected = correctAnswers.every((answer) =>
        selectedOptions.includes(answer)
      );

      const noIncorrectAnswersSelected = selectedOptions.every((option) =>
        correctAnswers.includes(option)
      );

      const isCorrect =
        allCorrectAnswersSelected && noIncorrectAnswersSelected && selectedOptions.length > 0;

      // A question is unanswered if nothing is selected
      const isUnanswered = selectedOptions.length === 0;

      // A question is incorrect if it's not correct and not unanswered
      const isIncorrect = !isCorrect && !isUnanswered;

      return {
        question_id: question.question_id || question.questionId,
        isCorrect,
        isIncorrect,
        isUnanswered,
        category: question.category || "TEST",
        isMultipleAnswer: true,
        isTextQuestion: false,
      };
    } else {
      // For single answer questions (original logic)
      return {
        question_id: question.question_id || question.questionId,
        isCorrect:
          question.selectedOption !== null &&
          question.selectedOption !== undefined &&
          question.selectedOption === question.correctAnswer,
        isIncorrect:
          question.selectedOption !== null &&
          question.selectedOption !== undefined &&
          question.selectedOption !== question.correctAnswer,
        isUnanswered: question.selectedOption === null || question.selectedOption === undefined,
        category: question.category || "TEST",
        isMultipleAnswer: false,
        isTextQuestion: false,
      };
    }
  });

  // Calculate stats
  const displayQuestions =
    processedQuestions.length > 0
      ? processedQuestions
      : Array.from([], (_, i) => ({
        question_id: i + 1,
        isCorrect: false,
        isIncorrect: false,
        isUnanswered: true,
        isMultipleAnswer: false,
        isTextQuestion: false,
      }));

  const correctCount = displayQuestions.filter((q) => q.isCorrect).length;
  const incorrectCount = displayQuestions.filter((q) => q.isIncorrect).length;

  const total = displayQuestions.length;



  // Determine pass/fail status (typically 60% is passing)
  const isPassed = correctCount >= Math.ceil(total * 0.6);

  // Get the current question's category or use test name as default
  const currentCategory =
    currentIndex < questions.length && questions[currentIndex].category
      ? questions[currentIndex].category
      : name || "TEST";

  // Count questions by category
  const categoryCounts = {};
  displayQuestions.forEach((q) => {
    if (!categoryCounts[q.category]) {
      categoryCounts[q.category] = 1;
    } else {
      categoryCounts[q.category]++;
    }
  });

  return (
    <div className="flex items-center justify-center bg-[#F5F6F8] ">
      <div className="w-full max-w-[372px] h-[calc(100vh-185px)]  gap-2 p-4 bg-white px-4 sm:px-6 md:px-8 py-6 sm:py-8 mb-10 mr-0 sm:mr-4 md:mr-8 rounded-lg shadow-lg">
        <div className="mb-4">
          <p className="text-lg sm:text-xl font-semibold mb-2">{userName}</p>
          <div className="flex justify-between items-center">
            <h1 className="text-sm sm:text-base text-gray-700 uppercase font-bold">
              {currentCategory}
            </h1>
            <span
              className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${isPassed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {isPassed ? "Passed" : "Failed"}
            </span>
          </div>

          <div className="flex mt-2">
            <div className="px-1 sm:px-2 py-1 sm:py-2 flex-1 flex flex-row border border-[#07C31D] mr-2 rounded-md text-black">
              <h2 className="text-sm sm:text-base font-medium mr-1">Correct:</h2>
              <p className="text-sm sm:text-base font-bold">
                {correctCount}/{total}
              </p>
            </div>
            <div className="px-1 sm:px-2 py-1 sm:py-2 flex-1 flex flex-row border border-[#C82F2F] rounded-md text-black">
              <h2 className="text-sm sm:text-base font-medium mr-1">Incorrect:</h2>
              <p className="text-sm sm:text-base font-bold">{incorrectCount}</p>
            </div>
          </div>
        </div>

        <hr className="border-gray-300 mb-4" />

        <div className="flex flex-row justify-center px-4 sm:px-8 py-2 border border-[#1349C5] rounded-md text-black mx-2 sm:mx-4">
          <h2 className="text-sm sm:text-base font-medium mr-1">Progress:</h2>
          <p className="text-sm sm:text-base font-bold">
            {correctCount + incorrectCount}/{total}
          </p>
        </div>

        <h2 className="text-base sm:text-lg font-bold mt-4 mb-3 ml-2 sm:ml-4">Questions</h2>

        <div className="flex justify-around gap-2 sm:gap-4 text-xs sm:text-sm mb-4 mx-2 sm:mx-4">
          <div className="flex items-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#07C31D] rounded-md mr-1 sm:mr-2"></div>
            Correct
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 rounded-md mr-1 sm:mr-2"></div>
            Unanswered
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#C82F2F] rounded-md mr-1 sm:mr-2"></div>
            Incorrect
          </div>
        </div>

      
      

        {/* Responsive grid with scrolling - replace the existing grid div */}
        <div className="overflow-y-auto max-h-64 sm:max-h-80 mb-6 px-2">
          <div className="grid grid-cols-5 gap-x-1 gap-y-2 mt-1 w-full">
            {displayQuestions.map((question, index) => {
              let bgColor = "bg-gray-200"; // Default for unanswered
              let text = "text-black";
              let borderStyle = "";

              if (question.isCorrect) {
                bgColor = "bg-[#07C31D]"; // Green for correct
                text = "text-white";
              } else if (question.isIncorrect) {
                bgColor = "bg-[#C82F2F]"; // Red for incorrect
                text = "text-white";
              }

              return (
                <button
                  key={index}
                  className={`${bgColor} ${text} ${borderStyle} font-semibold w-full min-w-8 h-8 sm:h-10 text-xs sm:text-sm rounded-md hover:opacity-80 transition ${currentIndex === index ? "ring-2 ring-blue-500" : ""}`}
                  onClick={() => onQuestionClick(index)}
                  title={`${displayQuestions[index].category || "Unknown"} - ${question.isMultipleAnswer ? "Multiple Answer Question" : "Single Answer Question"}`}
                >
                  {index + 1}
                  {question.isMultipleAnswer && <span className="text-xs">*</span>}
                </button>
              );
            })}
          </div>
        </div>



      </div>
    </div>
  );
};

export default Stu_SidebarViewResult;
