import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const BarChartComponent = ({ data }) => {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-medium mb-4   text-[#1349C5]">{data.title}</h2>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data.chartData} margin={{ top:10, right: 25,left: 20, bottom:30 }}>
          <XAxis dataKey={data.dataKey} />
          <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Bar dataKey="rank" fill="#1349C5" barSize={25} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;
