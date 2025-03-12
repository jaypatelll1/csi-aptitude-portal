// src/components/analytics/TableComponent.jsx
import React from "react";

const TableComponent = ({ title, data }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-medium text-[#1349C5] self-start">{title}</h2>
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 text-gray-700">Rank</th>
            <th className="text-left py-2 text-gray-700">Name</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="py-2 text-gray-700">{item?.department_rank || "N/A"}</td>
              <td className="py-2 text-gray-700">{item?.student_name || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;