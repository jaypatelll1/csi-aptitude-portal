import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AdmLineChartComponent = ({ data }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-[#1349C5]">{data.title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data.chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdmLineChartComponent;
