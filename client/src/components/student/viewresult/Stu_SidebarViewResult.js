import React, { useState, useEffect } from "react";
import axios from "axios";

const Stu_SidebarViewResult = ({ 
  name = "General Knowledge", 
  onQuestionClick,
  isPassed = true,
  userName = "Akshay Manjrekar",
  currentExamId,
  student_id,
  API_BASE_URL
}) => {
  const [questions, setQuestions] = useState([]);
  const [totalMarks, setTotalMarks] = useState(0);
  const [obtainedMarks, setObtainedMarks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch question status data
        const student_id = 524;
        const currentExamId = 74;
        const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
        const questionsRes = await axios.get(
          `${API_BASE_URL}/api/exams/results/correct-incorrect/${currentExamId}/${student_id}`,
          { withCredentials: true }
        );
        
    
        
        setQuestions(questionsRes.data);
        // setTotalMarks(marksRes.data.totalMarks);
        // setObtainedMarks(marksRes.data.obtainedMarks);
        setLoading(false);
      } catch (err) {
        setError("Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE_URL, currentExamId, student_id]);

  // Use placeholder data if loading or error
  const displayQuestions = loading || error ? 
    Array.from({ length: 30 }, (_, i) => ({
      question_id: i + 1,
      isCorrect: false,
      isIncorrect: false
    })) : 
    // Limit to 30 questions
    questions.slice(0, 30);

  // Calculate stats
  const correctCount = displayQuestions.filter(q => q.isCorrect).length;
  const incorrectCount = displayQuestions.filter(q => q.isIncorrect).length;
  const unansweredCount = displayQuestions.length - correctCount - incorrectCount;
  const total = displayQuestions.length;

  return (
    <div className="flex items-center justify-center bg-[#F5F6F8]">
      <div className="w-full max-w-[372px] h-[calc(100vh-195px)] overflow-hidden gap-2 p-4 bg-white px-4 sm:px-6 md:px-8 py-6 sm:py-8 mb-10 mr-0 sm:mr-4 md:mr-8 rounded-lg shadow-lg">
        <div className="mb-4">
        <p className="text-lg sm:text-xl font-semibold mb-2">{userName}</p>
          <div className="flex justify-between items-center">
          <h1 className="text-sm sm:text-base text-gray-700">{name}</h1>
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
                className={`${bgColor} ${text} font-semibold w-full min-w-8 h-8 sm:h-10 text-xs sm:text-sm rounded-md border hover:opacity-80 transition`}
                onClick={() => onQuestionClick(index)}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <div className="mb-4 p-2 sm:p-3 bg-gray-50 shadow rounded-lg text-xs sm:text-sm">
          <p className="font-semibold">Marks: {obtainedMarks}/{totalMarks}</p>
          <p>Total no. questions: {total}</p>
          <p>No. answered questions: {correctCount + incorrectCount}</p>
          <p>No. of unanswered questions: {unansweredCount}</p>
        </div>
      </div>
    </div>
  );
};

export default Stu_SidebarViewResult;