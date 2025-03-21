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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeacherResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!currentExamId || !teacher_id || !API_BASE_URL) {
          throw new Error("Missing required parameters");
        }
        
        const url = `${API_BASE_URL}/api/exams/teacher-results/${currentExamId}/${teacher_id}`;
        const response = await axios.get(url, { withCredentials: true });
        
        // Ensure responseData is always an array
        if (Array.isArray(response.data)) {
          setResponseData(response.data);
        } else if (response.data && typeof response.data === 'object') {
          // If it's an object with results property that's an array
          if (Array.isArray(response.data.results)) {
            setResponseData(response.data.results);
          } else {
            // Convert object to array if needed
            console.warn("Response data is not an array, converting to array format");
            setResponseData(Object.values(response.data));
          }
        } else {
          console.warn("Unexpected response format, using empty array");
          setResponseData([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching teacher results:", error);
        setError("Failed to load results. Please try again.");
        setLoading(false);
        setResponseData([]);
      }
    };

    if (currentExamId && teacher_id && API_BASE_URL) {
      fetchTeacherResults();
    } else {
      setLoading(false);
    }
  }, [currentExamId, teacher_id, API_BASE_URL]);

  const getQuestionStatus = (question) => {
    if (!question || !question.question_id) return "unanswered";
    
    // Ensure responseData is an array before using find
    if (!Array.isArray(responseData)) {
      console.error("responseData is not an array:", responseData);
      return "unanswered";
    }
    
    const response = responseData.find(r => r && r.question_id === question.question_id);
    
    if (!response) return "unanswered";
    if (response.is_correct) return "correct";
    if (response.is_answered && !response.is_correct) return "incorrect";
    if (response.is_reviewed) return "visited";
    return "answered";
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

  // Debug log to help understand the shape of responseData
  useEffect(() => {
    console.log("responseData type:", typeof responseData);
    console.log("responseData is array:", Array.isArray(responseData));
    console.log("responseData:", responseData);
  }, [responseData]);

  if (loading) return <div className="p-4 text-center">Loading teacher results...</div>;
  
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  
  if (!questions || questions.length === 0) {
    return <div className="p-4 text-center">No questions available.</div>;
  }

  return (
    <div className="bg-white rounded-md shadow-sm w-full max-w-md p-4">
      {/* Header */}
      <h2 className="text-lg font-semibold mb-3">{name || "Exam Review"}</h2>
      
      {/* Status Legend */}
      <div className="flex flex-wrap mb-4 gap-2">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded mr-1"></div>
          <span className="text-xs">Answered</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-300 rounded mr-1"></div>
          <span className="text-xs">Visited</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-300 rounded mr-1"></div>
          <span className="text-xs">Unanswered</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded mr-1"></div>
          <span className="text-xs">Correct</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded mr-1"></div>
          <span className="text-xs">Incorrect</span>
        </div>
      </div>

      {/* Question Grid */}
      <div className="mb-6">
        {[...Array(Math.ceil(questions.length / 5))].map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-2 mb-2">
            {questions.slice(rowIndex * 5, (rowIndex + 1) * 5).map((question, index) => {
              const absoluteIndex = rowIndex * 5 + index;
              const questionNumber = absoluteIndex + 1;
              
              // Use a try-catch to prevent any errors in getQuestionStatus
              let status = "unanswered";
              try {
                status = getQuestionStatus(question);
              } catch (e) {
                console.error("Error getting question status:", e);
              }
              
              let bgColor = "bg-gray-300";
              
              switch(status) {
                case "correct": bgColor = "bg-green-500"; break;
                case "incorrect": bgColor = "bg-red-500"; break;
                case "visited": bgColor = "bg-blue-300"; break;
                case "answered": bgColor = "bg-blue-500"; break;
                default: bgColor = "bg-gray-300";
              }
              
              // Highlight the current question
              const isCurrentQuestion = absoluteIndex === currentIndex;
              const borderStyle = isCurrentQuestion ? "border-2 border-black" : "";

              return (
                <button
                  key={questionNumber}
                  className={`${bgColor} ${borderStyle} text-white w-full h-10 rounded flex items-center justify-center`}
                  onClick={() => onQuestionClick(absoluteIndex)}
                >
                  {questionNumber}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      

      {/* Submit Button */}
      <button 
        onClick={handleSubmitResults}
        className="w-full bg-blue-500 text-white py-3 rounded font-medium hover:bg-blue-600 transition"
      >
        Submit Results
      </button>
    </div>
  );
};

export default Dep_PresidentViewResult;