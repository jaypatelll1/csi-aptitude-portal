import React from "react";

const DisplayComponent = ({ title, rank, superscript }) => {
  return (
    <div className="flex flex-col items-center ">
      <h2 className="text-xl font-medium text-[#1349C5] self-start">{title}</h2>
      <span className="text-5xl flex items-center  font-bold text-gray-900">
        {rank}
        {superscript ? <sup className="text-xl">{superscript}</sup> : null}
      </span>
    </div>
  );
};

export default DisplayComponent;