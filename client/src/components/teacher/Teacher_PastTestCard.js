import React from "react";

const Teacher_PastTestCard = ({ testName, submittedOn, time, status, max_score, total_score }) => {
  let colur;
  if (status === "Passed") {
    colur = "bg-green-200 text-green-600";
  } else {
    colur = "bg-red-200 text-red-600";
  }

  return (
    <div className="w-80 border border-gray-200 rounded-lg bg-white p-4 relative">
      <h1 className="fo   nt-semibold text-xl">{testName}</h1>
      <div className="text-sm text-gray-500 mt-3 space-y-1">
        <p>Submitted on: {submittedOn}</p>
        <p>Time taken: {time}</p>
        <p>
          Marks: {total_score}/{max_score}
        </p>
      </div>
      <div
        className={`h-8 w-24 ${colur} rounded-xl flex items-center justify-center absolute bottom-4 right-4`}
      >
        <h1 className={colur}>{status}</h1>
      </div>
    </div>
  );
};

export default Teacher_PastTestCard;
