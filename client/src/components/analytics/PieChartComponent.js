import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const PieChartComponent = ({ data }) => {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-medium mb-4 text-[#1349C5]">{data.title}</h2>
      <ResponsiveContainer width={400} height={400}>
        <PieChart>
          <Pie
            data={data.chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            fill="#1349C5"
            label
          >
            {data.chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartComponent;
