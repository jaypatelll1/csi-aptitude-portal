import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

const Dep_ViewQuestionCard = ({
  id,
  question_type,
  text,
  options,
  index,
  correct_option,
  correct_options,
  category,
  image_url,
}) => {
  const navigate = useNavigate();
  const exam_id = useSelector((state) => state.exam.examId);

  const handleEditQuestion = () => {
    navigate(`/department/input?category=${encodeURIComponent(category)}`, {
      state: {
        questionId: id,
        questionType: question_type,
        questionText: text,
        questionOptions: options,
        exam_id: exam_id,
        correct_option: correct_option,
        correct_options: correct_options,
        category: category,
        image_url: image_url,
        questionNumber: index + 1,
      },
    });
    console.log("category is ", category);
  };
  const handleDeleteQuestion = async () => {
    let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
    const response = await axios.delete(`${API_BASE_URL}/api/exams/questions/${exam_id}/${id}`, {
      withCredentials: true,
    });
    // console.log('response is ',response);
    // Reload the page
    window.location.reload();
  };

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
        className="text-[#0044AB] hover:text-blue-700 font-medium hover:underline"
      >
        Edit Question
      </button>

      {/* {handle delete } */}
      <button
        onClick={handleDeleteQuestion}
        className="text-[#0044AB] hover:text-blue-700 font-medium hover:underline ml-5"
      >
        Delete Question
      </button>
    </div>
  );
};

export default Dep_ViewQuestionCard;
