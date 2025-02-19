import React from "react";

const DepartmentRanking = () => {
  //  Dummy data added inside the component itself
  const departmentData = [
    { rank: "1st", name: "Computer Science" },
    { rank: "2nd", name: "Information Technology" },
    { rank: "3rd", name: "Electronics and Telecommunication" },
    { rank: "4th", name: "Electronics and Computer Science" },
    { rank: "5th", name: "Electrical" },
  ];

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Department Ranking</h2>
      <div className="border rounded-lg p-2">
        {departmentData.map((dept, index) => (
          <div
            key={index}
            className="flex justify-between p-3 border rounded-lg mb-2 shadow-sm"
          >
            <span className="font-semibold">{dept.rank}</span>
            <span>{dept.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentRanking;
