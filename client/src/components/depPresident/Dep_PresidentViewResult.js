import React, { useState, useEffect } from "react";
import axios from "axios";

const Dep_PresidentViewResult = ({
  questions = [],
  currentIndex = 0,
  onQuestionClick,
  currentExamId,
  teacher_id,
  API_BASE_URL,
  savedQuestions = [], 
}) => {
  // New state to track visited questions
  const [visitedQuestions, setVisitedQuestions] = useState([]);

  // Update visited questions when current index changes
  useEffect(() => {
    // Only add to visited questions if it's not already saved and not already in visited
    if (
      currentIndex >= 0 && 
      currentIndex < questions.length && 
      !savedQuestions.includes(questions[currentIndex]?.question_id) &&
      !visitedQuestions.includes(questions[currentIndex]?.question_id)
    ) {
      setVisitedQuestions(prev => [
        ...prev, 
        questions[currentIndex]?.question_id
      ]);
    }
  }, [currentIndex, questions, savedQuestions]);

  const getQuestionStatus = (question, index) => {
    // If it's the current question
    if (index === currentIndex) {
      // Check if the current question is saved
      return savedQuestions.includes(question?.question_id) 
        ? "checked"   // Visited and saved
        : (visitedQuestions.includes(question?.question_id) 
            ? "visited"  // Visited but not saved
            : "unanswered");  // Not visited yet
    }

    // Check if the question is saved/checked
    if (savedQuestions.includes(question?.question_id)) {
      return "checked";
    }

    // Check if the question is visited
    if (visitedQuestions.includes(question?.question_id)) {
      return "visited";
    }

    // For text questions
    if (question?.question_type === "text") {
      return question.selected_response === null ? "unanswered" : "answered";
    }

    // For multiple choice or single choice questions
    if (!question?.selected_response) return "unanswered";

    // If a response is selected, it's answered
    return "answered";
  };

  // Updated color mapping with interchanged colors
  const statusColors = {
    visited: "#FFA500",     // Orange for visited but not saved
    unanswered: "#D3D3D3",  // Light gray for unanswered
    answered: "#32CD32",    // Green for answered
    checked: "#0047AB"      // Blue for checked/saved
  };

  if (!questions || questions.length === 0) {
    return <div className="p-4 text-center">No questions available.</div>;
  }

  return (
    <div className="bg-white rounded-lg h-auto shadow-sm p-4">
      <p className="font-semibold mb-3">Questions</p>

      {/* Status Legend */}
      <div className="flex flex-col flex-wrap mb-2">
        {Object.entries({
          visited: "Visited",
          answered: "Answered",
          unanswered: "Unanswered",
          checked: "Checked"
        }).map(([status, label]) => (
          <div key={status} className="flex items-center mr-4 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{backgroundColor: statusColors[status]}}
            ></div>
            <span className="text-xs ml-1">{label}</span>
          </div>
        ))}
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-5 text-lg gap-2 mb-6">
        {questions.map((question, index) => {
          const questionNumber = index + 1;
          const status = getQuestionStatus(question, index);

          return (
            <button
              key={questionNumber}
              className={`text-white h-8 w-full rounded-md flex items-center justify-center text-sm`}
              style={{backgroundColor: statusColors[status]}}
              onClick={() => onQuestionClick(index)}
            >
              {questionNumber}
            </button>
          )
        })}
      </div>

      {/* Action Buttons
      <button
        onClick={handleSubmitResults}
        className="w-full bg-green-500 text-white py-2 rounded-md font-medium"
      >
        Submit Results
      </button> */}
    </div>
  );
};

export default Dep_PresidentViewResult;