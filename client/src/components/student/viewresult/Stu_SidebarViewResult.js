import React from "react";

const Stu_SidebarViewResult = ({ 
  questions = [],
  currentIndex = 0,
  onQuestionClick,
  totalMarks = 0,
  obtainedMarks = 0,
  userName = "Student",
  name = "Test"
}) => {
  // Process questions to match the expected format for this component
  // Handle both single answer and multiple answer questions
  const processedQuestions = questions.map(question => {
    if (question.isMultipleAnswer) {
      // For multiple answer questions
      const selectedOptions = question.selectedOptions || [];
      const correctAnswers = question.correctAnswers || [];
      
      // A question is correct if all correct answers are selected and no incorrect answers are selected
      const allCorrectAnswersSelected = correctAnswers.every(answer => 
        selectedOptions.includes(answer)
      );
      
      const noIncorrectAnswersSelected = selectedOptions.every(option => 
        correctAnswers.includes(option)
      );
      
      const isCorrect = allCorrectAnswersSelected && noIncorrectAnswersSelected && selectedOptions.length > 0;
      
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
        isMultipleAnswer: true
      };
    } else {
      // For single answer questions (original logic)
      return {
        question_id: question.question_id || question.questionId,
        isCorrect: question.selectedOption !== null && 
                  question.selectedOption !== undefined && 
                  question.selectedOption === question.correctAnswer,
        isIncorrect: question.selectedOption !== null && 
                    question.selectedOption !== undefined && 
                    question.selectedOption !== question.correctAnswer,
        isUnanswered: question.selectedOption === null || 
                    question.selectedOption === undefined,
        category: question.category || "TEST",
        isMultipleAnswer: false
      };
    }
  });
  
  // Calculate stats
  const displayQuestions = processedQuestions.length > 0 ? 
    processedQuestions.slice(0, 30) : // Limit to 30 questions
    Array.from({ length: 30 }, (_, i) => ({
      question_id: i + 1,
      isCorrect: false,
      isIncorrect: false,
      isUnanswered: true,
      isMultipleAnswer: false
    }));
    
  const correctCount = displayQuestions.filter(q => q.isCorrect).length;
  const incorrectCount = displayQuestions.filter(q => q.isIncorrect).length;
  const unansweredCount = displayQuestions.filter(q => q.isUnanswered).length;
  const total = displayQuestions.length;
  const multipleAnswerCount = displayQuestions.filter(q => q.isMultipleAnswer).length;
  
  // Calculate marks based on correct answers
  const calculatedObtainedMarks = correctCount;
  const calculatedTotalMarks = total;
  
  // Determine pass/fail status (typically 60% is passing)
  const isPassed = correctCount >= Math.ceil(total * 0.6);
  
  // Get category from first question or use default
  const category = questions.length > 0 && questions[0].category ? 
    questions[0].category : "TEST";

  return (
    <div className="flex items-center justify-center bg-[#F5F6F8] ">
      <div className="w-full max-w-[372px] h-[calc(100vh-195px)] mt-8 overflow-y-auto overflow-x-hidden gap-2 p-4 bg-white px-4 sm:px-6 md:px-8 py-6 sm:py-8 mb-10 mr-0 sm:mr-4 md:mr-8 rounded-lg shadow-lg">
        <div className="mb-4">
          <p className="text-lg sm:text-xl font-semibold mb-2">{userName}</p>
          <div className="flex justify-between items-center">
            <h1 className="text-sm sm:text-base text-gray-700 uppercase font-bold">{category}</h1>
            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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

        {/* Responsive grid with auto-sizing for different screen sizes */}
        <div className="grid grid-cols-5 gap-x-1 gap-y-2 mb-6 w-full px-2">  
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
            
            // Add special indicator for multiple answer questions
            if (question.isMultipleAnswer) {
              borderStyle = "border-2 border-blue-500";
            }
            
            return (
              <button
                key={index}
                className={`${bgColor} ${text} ${borderStyle} font-semibold w-full min-w-8 h-8 sm:h-10 text-xs sm:text-sm rounded-md hover:opacity-80 transition ${currentIndex === index ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => onQuestionClick(index)}
                title={question.isMultipleAnswer ? "Multiple Answer Question" : "Single Answer Question"}
              >
                {index + 1}
                {question.isMultipleAnswer && <span className="text-xs">*</span>}
              </button>
            );
          })}
        </div>

        <div className="mb-4 p-2 sm:p-3 bg-gray-50 shadow rounded-lg text-xs sm:text-sm">
          <p className="font-semibold">Marks: {calculatedObtainedMarks}/{calculatedTotalMarks}</p>
          <p>Total no. questions: {total}</p>
          <p>No. of answered questions: {correctCount + incorrectCount}</p>
          <p>No. of unanswered questions: {unansweredCount}</p>
          {multipleAnswerCount > 0 && (
            <p>Multiple answer questions: {multipleAnswerCount}</p>
          )}
        </div>
        
        {multipleAnswerCount > 0 && (
          <div className="mb-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs sm:text-sm">
            <p className="text-blue-800">
              <span className="font-semibold">Note:</span> Questions marked with <span className="text-blue-500">*</span> and blue borders require multiple answers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stu_SidebarViewResult;