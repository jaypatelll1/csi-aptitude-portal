import React from "react";

const Sup_DashboardTiles = ({ tileData }) => {
  const colors = {
    "Students": "bg-blue-500",
    "Teachers": "bg-orange-500", 
    "Branches": "bg-green-500",
  };

  const icons = {
    "Students": (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" fill="currentColor"/>
        <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" fill="currentColor"/>
      </svg>
    ),
    "Teachers": (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor"/>
        <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" fill="currentColor"/>
      </svg>
    ),
    "Branches": (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3L2 12H5V20H19V12H22L12 3ZM7 18V10H17V18H7Z" fill="currentColor"/>
      </svg>
    ),
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {tileData.map((item, index) => (
        <div
          key={index}
          className="flex items-center bg-white shadow-lg rounded-xl p-6 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
        >
          {/* Vertical colored bar */}
          <div className={`w-1 h-16 rounded-full ${colors[item.label]} mr-4`}></div>

          {/* Content Section */}
          <div className="flex items-center justify-between flex-grow">
            <div className="flex flex-col">
              <p className="text-gray-500 text-sm font-medium mb-1">{item.label}</p>
              <h1 className="text-black text-3xl font-bold">{item.value}</h1>
            </div>
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-xl ${
                colors[item.label]
              } bg-opacity-20`}
            >
              <div className={`${colors[item.label].replace('bg-', 'text-')}`}>
                {icons[item.label]}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Sup_DashboardTiles;