import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const LineChartComponent = ({ data }) => {
  return (
    <div className="flex flex-col items-center  ">
      <h2 className="text-xl font-medium mb-4 text-[#1349C5]">{data.title}</h2>
      <ResponsiveContainer  width={750} height={200}>
        <LineChart data={data.chartData}>
          <CartesianGrid strokeDasharray="4 4" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Percentage" stroke={data.color || "#1349C5"} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;
