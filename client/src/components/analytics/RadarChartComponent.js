import React from "react";
import {RadarChart,Radar,PolarGrid,PolarAngleAxis,PolarRadiusAxis,ResponsiveContainer,Tooltip,} from "recharts";

const RadarChartComponent = ({ data }) => {
  // console.log(data)
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-medium mb-4 text-[#1349C5]">{data.title}</h2>
      <ResponsiveContainer width={700} height={400} >
        <RadarChart cx="50%" cy="50%" outerRadius="90%" data={data.chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis />
          <Tooltip />
          <Radar dataKey="value" stroke="#1349C5" fill="#6F91F0" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChartComponent;
