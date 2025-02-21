import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const BarChartComponent = ({ data }) => {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-medium mb-4 mt-5  text-[#1349C5]">{data.title}</h2>
      <ResponsiveContainer width={500} height={300}>
        <BarChart data={data.chartData} margin={{ top: 40, right: 30, left: 20, bottom: 20 }}>
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
