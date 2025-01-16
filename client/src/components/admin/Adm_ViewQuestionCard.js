
import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

const Adm_ViewQuestionCard = ({ id, text, options, index, correct_option }) => {
  const navigate = useNavigate();
 
  const exam_id = useSelector((state) => state.exam.examId);

  

  const handleEditQuestion = () => {
    navigate("/admin/input", {
      state: {
        questionId: id,
        questionText: text,
        questionOptions: options,
        exam_id: exam_id,
        correct_option : correct_option,
      },
    });
  };
const handleDeleteQuestion= async () => {
  const response = await axios.delete(`/api/exams/questions/${exam_id}/${id}`)
  console.log('response is ',response);
 // Reload the page
window.location.reload();

  
}

  return (
    <div className="p-4 bg-white shadow-sm rounded-lg border border-gray-300 font-poppins">
      <h3 className="text-lg font-medium mb-2">Question {index + 1}</h3>
      <p className="text-gray-600 text-sm mb-4">{text}</p>
{/* 
      <div className="mb-4">
        <h4 className="text-gray-700 text-sm font-medium mb-2">Options:</h4>
        {options.map((option, idx) => (
          <p key={idx} className="text-gray-600 text-sm">
            {String.fromCharCode(65 + idx)}. {option}
          </p>
        ))}
      </div> */}
{/* {handle edit } */}
      <button
        onClick={handleEditQuestion}
        className="text-[#0044AB] hover:text-blue-700 font-medium"
      >
        Edit Question
      </button>

      {/* {handle delete } */}
      <button
        onClick={handleDeleteQuestion}
        className="text-[#0044AB] hover:text-blue-700 font-medium ml-5"
      >
        Delete Question 
      </button>
    </div>
  );
};

export default Adm_ViewQuestionCard;
