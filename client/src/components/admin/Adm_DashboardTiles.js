import React from "react";

const Adm_DashboardTiles = ({ tileData }) => {
  const colors = {
    "Active Students": "bg-blue-500",
    "Live Tests": "bg-purple-500",
    "Scheduled Tests": "bg-orange-500",
    "Students in Last Exam": "bg-green-500",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:w-full  gap-4 p-4">
      {tileData.map((item, index) => (
        <div
          key={index}
          className="flex items-center bg-white shadow-lg rounded-lg p-5 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
        >
          {/* Vertical colored bar */}
          <div className={`w-2 h-[80px] rounded ${colors[item.label]}`}></div>

          {/* Content Section */}
          <div className="flex items-center justify-between flex-grow pl-4">
            <div className="flex flex-col space-y-1">
              <p className="text-gray-500 text-xl font-bold">{item.label}</p>
              <h1 className="text-black text-xl font-bold">{item.value}</h1>
            </div>
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                colors[item.label]
              } bg-opacity-20`}
            >
              <span className="text-lg font-bold">👥</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Adm_DashboardTiles;
