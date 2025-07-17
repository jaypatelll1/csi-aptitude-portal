import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const DonutChartComponent = ({ data }) => {
  const [hoveredValue, setHoveredValue] = useState(null);

  const total = data.chartData.reduce((sum, entry) => sum + entry.value, 0);
  const percentageData = data.chartData.reduce((acc, entry) => {
    acc[entry.name] = ((entry.value / total) * 100).toFixed(0);
    return acc;
  }, {});

  const displayPercentage = hoveredValue ? percentageData[hoveredValue] : percentageData["Correct"];

  return (
    <div className="flex flex-col relative items-center ">
      {/* Align only the title to the left */}
      <h2 className="text-xl font-medium text-[#1349C5] self-start">{data.title}</h2>

      {/* Keep chart centered */}
      <div className="flex flex-col items-center relative w-[250px] h-[250px] mt-10 ">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data.chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={100}
              label={false}
              onMouseEnter={(entry) => setHoveredValue(entry.name)}
              onMouseLeave={() => setHoveredValue(null)}
            >
              {data.chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        {/* Properly Centered Percentage */}
        <div className="absolute text-4xl font-bold mt-24 text-gray-700">{displayPercentage}%</div>
      </div>
    </div>
  );
};

export default DonutChartComponent;
