import React, { useEffect, useState } from "react";
import axios from "axios";

const Dep_PresidentViewResult = ({
  name,
  questions = [],
  currentIndex = 0,
  onQuestionClick,
  currentExamId,
  teacher_id,
  API_BASE_URL
}) => {
  const [responseData, setResponseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMark, setselectedMark] = useState(null)

  const getQuestionStatus = (question) => {
    if (!question || !question.question_id) return "unanswered";

    
    if (!Array.isArray(questions)) {
      console.error("responseData is not an array:", responseData);
      return "unanswered";
    }

    
    const response = questions.find(r => r && r.question_id === question.question_id);

    if (response.question_type === "text") {
      if (response.selected_response === null) {
        return "unanswered";
      } else {
        return "answered";
      }
    }

    if (!response) return "unanswered"; 

    const { correct_answer, selected_response, result_status } = response;

    
    if (!selected_response) return "unanswered";

    
    if (result_status === "true") return "correct";
    if (result_status === "false") return "incorrect";

    
    return correct_answer === selected_response ? "correct" : "incorrect";
  };


  const handleSubmitResults = async () => {
    if (!currentExamId || !teacher_id || !API_BASE_URL) {
      alert("Missing required information for submission");
      return;
    }

    try {
      const url = `${API_BASE_URL}/api/exams/teacher-results/submit/${currentExamId}/${teacher_id}`;
      await axios.post(url, {}, { withCredentials: true });
      alert("Results submitted successfully!");
    } catch (error) {
      console.error("Error submitting teacher results:", error);
      alert("Submission failed. Please try again.");
    }
  };

  


  if (loading) return <div className="p-4 text-center">Loading teacher results...</div>;

  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  if (!questions || questions.length === 0) {
    return <div className="p-4 text-center">No questions available.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <p className="font-semibold mb-3">Questions</p>

      <div className="flex flex-wrap mb-2">
        <div className="flex items-center mr-4 mb-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
          <span className="text-xs">Correct</span>
        </div>
        <div className="flex items-center mr-4 mb-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
          <span className="text-xs">Failed</span>
        </div>
        <div className="flex items-center mr-4 mb-2">
          <div className="w-3 h-3 rounded-full bg-gray-300 mr-1"></div>
          <span className="text-xs">Unattempted</span>
        </div>

      </div>

      <div className="grid grid-cols-5 gap-2 mb-6">
        {questions.map((question, index) => {
          const questionNumber = index + 1;

          let status = "unanswered";
          try {
            status = getQuestionStatus(question);
          } catch (e) {
            console.error("Error getting question status:", e);
          }

          let bgColor = "bg-gray-200"; 

          switch (status) {
            case "correct": bgColor = "bg-blue-500"; break; 
            case "incorrect": bgColor = "bg-yellow-500"; break; 
            case "visited": bgColor = "bg-green-500"; break; 
            case "answered": bgColor = "bg-blue-500"; break; 
            default: bgColor = "bg-gray-200"; 
          }

          
          const isCurrentQuestion = index === currentIndex;
          const buttonColor = isCurrentQuestion ? "bg-blue-600" : bgColor;
          const textColor = "text-white";

          return (
            <button
              key={questionNumber}
              className={`${buttonColor} ${textColor} h-8 w-full rounded-md flex items-center justify-center text-sm`}
              onClick={() => onQuestionClick(index)}
            >
              {questionNumber}
            </button>
          );
        })}
      </div>



      <button
        className="w-full bg-blue-600 text-white py-2 rounded-md font-medium mb-2"
      >
        Save And End
      </button>

      <button
        onClick={handleSubmitResults}
        className="w-full bg-green-500 text-white py-2 rounded-md font-medium"
      >
        Submit Results
      </button>
    </div>
  );
};

export default Dep_PresidentViewResult;