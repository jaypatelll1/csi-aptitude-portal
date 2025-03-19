// src/components/analytics/TableComponent.jsx
import React from "react";

const TableComponent = ({ title, data, type }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-xl font-medium text-[#1349C5] self-start">{title}</h2>
      <table className="w-full space-y-3">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 text-gray-700">Rank</th>
            <th className="text-center py-2 text-gray-700">Name</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item, index) => (
            <tr key={index} className="border-b">
              {type === "overall" ? (
                <td className="py-2 text-gray-700">
                  {item?.overall_rank || "N/A"}
                </td>
              ) : (
                <td className="py-4 text-gray-700 text-md">
                  {item?.department_rank || "N/A"}
                </td>
              )}

              <td className="py-4 text-gray-700 text-md">
                {item?.student_name || "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;
