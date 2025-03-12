import React from "react";

const PerformanceComponent = () => {
  

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-medium text-[#1349C5] self-start">Top Performers</h2>
      <div className="border p-2 rounded-md">
        {topPerformers.map((performer) => (
          <div key={performer.rank} className="border p-2 rounded-md my-1">
            {performer.rank} {performer.name}
          </div>
        ))}
      </div>

      <h2 className="text-xl font-medium text-[#1349C5] self-start">Bottom Performers</h2>
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
