import React from "react";
import { RadialBarChart, RadialBar, Legend, Tooltip, ResponsiveContainer } from "recharts";

const RadialChartComponent = ({ data }) => {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-medium text-[#1349C5] self-start">{data.title}</h2>
      <ResponsiveContainer width={450} height={400}>
        <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" barSize={15} data={data.chartData}>
          <RadialBar minAngle={15} label={{ position: "insideStart", fill: "#fff" }} background clockWise dataKey={data.dataKey} />
          <Tooltip />
          <Legend />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadialChartComponent;
