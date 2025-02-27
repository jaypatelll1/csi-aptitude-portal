import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const LineChartComponent = ({ data }) => {

  const CustomTick = (props) => {
    const { x, y, payload } = props;
    const words = payload.value.split(" ");
    return (
      <text x={x} y={y + 10} textAnchor="middle" fill="#333">
        {words.map((word, index) => (
          <tspan key={index} x={x} dy={index * 15}>
            {word}
          </tspan>
        ))}
      </text>
    );
  };

  return (
    <div className="flex flex-col items-center w-full">
  <h2 className="text-xl font-medium mb-4 text-[#1349C5]">{data.title}</h2>
  <div className="w-full max-w-[750px]">
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data.chartData}>
        <CartesianGrid strokeDasharray="4 4" />
        <XAxis dataKey="name" tick={<CustomTick />} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="Percentage"
          stroke={data.color || "#1349C5"}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
</div>

  );
};

export default LineChartComponent;