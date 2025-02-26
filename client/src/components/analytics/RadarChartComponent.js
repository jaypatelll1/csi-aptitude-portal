import React from "react";
import {RadarChart,Radar,PolarGrid,PolarAngleAxis,PolarRadiusAxis,ResponsiveContainer,Tooltip,} from "recharts";

const RadarChartComponent = ({ data }) => {
  if (!data || !data.chartData || data.chartData.length === 0) {
    return <p className="text-center text-gray-500">No Data Available</p>;
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-medium mb-4 text-[#1349C5]">{data.title}</h2>
      <ResponsiveContainer width={700} height={300}>
        <RadarChart cx="50%" cy="50%" outerRadius="90%" data={data.chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis />
          <Tooltip />
          {/* Multiple Radar components to display all values */}
          <Radar dataKey="yourScore" stroke="#1349C5" fill="#1349C5" fillOpacity={0.6} />
          <Radar dataKey="averagePercentage" stroke="#6A88F7" fill="#6A88F7" fillOpacity={0.4} />
          <Radar dataKey="maxMarks" stroke="#D3D3D3" fill="#D3D3D3" fillOpacity={0.3} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};


export default RadarChartComponent;
