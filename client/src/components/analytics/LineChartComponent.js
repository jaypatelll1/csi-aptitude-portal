import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const LineChartComponent = ({ data }) => {
  // Custom XAxis tick component
  const CustomTick = (props) => {
    const { x, y, payload } = props;
    const words = payload.value.split("-");
    return (
      <text x={x} y={y + 10} textAnchor="middle" fill="#333" fontSize={14}>
        {words.map((word, index) => (
          <tspan key={index} x={x} dy={index * 15}>
            {word}
          </tspan>
        ))}
      </text>
    );
  };

  // Custom label component for data points
  const CustomLabel = (props) => {
    const { x, y, value } = props;
    return (
      <text 
        x={x} 
        y={y - 10}  // Position above the point
        textAnchor="middle" 
        fill="#666"
        fontSize="14"
      >
        {value}
      </text>
    );
  };

  return (
    <div className="flex flex-col items-start w-full">
  <h2 className="text-xl font-medium text-[#1349C5] self-start">{data.title}</h2>
      <div className="w-full max-w-[800px]  ">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart  data={data.chartData}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis dataKey="name" tick={<CustomTick />} />
            <YAxis domain={[0, 100]} fontSize={14} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="Average"
              stroke={data.color || "#1349C5"}
              activeDot={{ r: 8 }}
              y1={10}
              label={<CustomLabel />}  // Add labels to data points
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChartComponent;