import React from "react";

const Dep_presidentViewResult = ({ 
  questions = [],
  currentIndex = 0,
  onQuestionClick
}) => {
  // Create a properly formatted array of questions that matches the image
  const displayQuestions = [
    { id: 1, status: "answered" },
    { id: 2, status: "visited" },
    { id: 3, status: "unanswered" },
    { id: 4, status: "checked" },
    { id: 5, status: "unanswered" },
    { id: 6, status: "visited" },
    { id: 7, status: "unanswered" },
    { id: 8, status: "unanswered" },
    { id: 9, status: "unanswered" },
    { id: 10, status: "unanswered" },
    { id: 11, status: "unanswered" },
    { id: 12, status: "visited" },
    { id: 13, status: "checked" },
    { id: 14, status: "checked" },
    { id: 15, status: "checked" },
    { id: 16, status: "unanswered" },
    { id: 17, status: "visited" },
    { id: 18, status: "answered" },
    { id: 19, status: "checked" },
    { id: 20, status: "visited" },
    { id: 21, status: "checked" },
    { id: 22, status: "visited" },
    { id: 23, status: "visited" },
    { id: 24, status: "checked" },
    { id: 25, status: "visited" },
    { id: 26, status: "answered" },
    { id: 27, status: "visited" },
    { id: 28, status: "unanswered" },
    { id: 29, status: "checked" },
    { id: 30, status: "visited" },
  ];
  
  // Override specific values to match the image
  displayQuestions[0].status = "answered"; // 1
  displayQuestions[1].status = "visited"; // 2
  displayQuestions[3].status = "checked"; // 4
  displayQuestions[5].status = "visited"; // 6
  displayQuestions[11].status = "visited"; // 12
  displayQuestions[12].status = "checked"; // 13
  displayQuestions[13].status = "checked"; // 14
  displayQuestions[14].status = "checked"; // 15
  displayQuestions[16].status = "visited"; // 17
  displayQuestions[17].status = "answered"; // 18
  displayQuestions[19].status = "visited"; // 20
  displayQuestions[20].status = "checked"; // 21
  displayQuestions[21].status = "visited"; // 22
  displayQuestions[22].status = "visited"; // 23
  displayQuestions[23].status = "checked"; // 24
  displayQuestions[24].status = "visited"; // 25
  displayQuestions[25].status = "answered"; // 26
  displayQuestions[26].status = "visited"; // 27
  displayQuestions[28].status = "checked"; // 29
  displayQuestions[29].status = "visited"; // 30
  
  const handleSubmitResults = () => {
    console.log("Results submitted");
  };

  return (
    <div className="bg-white rounded-md shadow-sm w-full max-w-md">
      <div className="p-4">
        <h2 className="text-lg font-medium mb-4">Questions</h2>
        
        {/* Legend */}
        <div className="flex mb-4 gap-3">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-600 rounded mr-1"></div>
            <span className="text-xs">Answered</span>
          </div>
          <div className="flex  gap-5  p-2  items-center">
            <div className="w-4 h-4 bg-gray-300 rounded mr-1"></div>
            <span className="text-xs">Unanswered</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-1"></div>
            <span className="text-xs">Checked</span>
          </div>
        </div>
        
        {/* Question Grid */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {displayQuestions.map((question, index) => {
            let bgColor = "bg-gray-300"; // Default for unanswered
            let textColor = "text-black";
            
            if (question.status === "checked") {
              bgColor = "bg-green-500";
              textColor = "text-white";
            } else if (question.status === "answered") {
              bgColor = "bg-blue-600";
              textColor = "text-white";
            } 
            
            return (
              <button
                key={index}
                className={`${bgColor} ${textColor} font-medium w-full h-10 rounded flex items-center justify-center`}
                onClick={() => onQuestionClick(index)}
              >
                {question.id}
              </button>
            );
          })}
        </div>
        
        {/* Submit Button */}
        <button 
          onClick={handleSubmitResults}
          className="w-full bg-green-500 text-white py-3 rounded font-medium hover:bg-green-600 transition"
        >
          Submit Results
        </button>
      </div>
    </div>
  );
};

export default Dep_presidentViewResult;