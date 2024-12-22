import React from "react";

const Adm_ViewQuestionCard = ({ id, text }) => {
  return (
    <div className="p-4 bg-white shadow-sm rounded-lg border border-gray-300 font-poppins">
      <h3 className="text-lg font-medium mb-2">Question {id}</h3>
      <p className="text-gray-600 text-sm mb-4">{text}</p>
      <hr className="border-gray-300 mb-4" />
      <button className="text-[#0044AB] hover:text-blue-700 font-medium">
        Edit Question
      </button>
    </div>
  );
};

export default Adm_ViewQuestionCard;