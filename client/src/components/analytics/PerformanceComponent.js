import React from "react";

const PerformanceComponent = () => {
  // Dummy data for top and bottom performers
  const topPerformers = [
    { rank: 1, name: "Jaydeep Joshi" },
    { rank: 2, name: "Jaydeep Joshi" },
    { rank: 3, name: "Jaydeep Joshi" },
  ];

  const bottomPerformers = [
    { rank: 98, name: "Jaydeep Joshi" },
    { rank: 99, name: "Jaydeep Joshi" },
    { rank: 100, name: "Jaydeep Joshi" },
  ];

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-lg font-bold text-blue-700">Top Performers</h2>
      <div className="border p-2 rounded-md">
        {topPerformers.map((performer) => (
          <div key={performer.rank} className="border p-2 rounded-md my-1">
            {performer.rank} {performer.name}
          </div>
        ))}
      </div>

      <h2 className="text-lg font-bold text-blue-700 mt-4">Bottom Performers</h2>
      <div className="border p-2 rounded-md">
        {bottomPerformers.map((performer) => (
          <div key={performer.rank} className="border p-2 rounded-md my-1">
            {performer.rank} {performer.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceComponent;
