import React from "react";

const DisplayComponent = ({ title, value }) => {
  return (
    <div className=" flex flex-col items-center border-2 border-gray-400 rounded-lg p-6 size-28 h-32 mb-2  ">
      <h2 className="text-lg font-semibold mb-2 ">{title}</h2>
      <span className="text-6xl font-bold text-[#1349C5] ">{value}</span>
    </div>
  );
};

export default DisplayComponent;
