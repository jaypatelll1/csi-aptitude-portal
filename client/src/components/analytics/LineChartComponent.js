import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const LineChartComponent = ({ data }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-xl font-medium mb-4 text-[#1349C5]">{data.title}</h2>
      <div className="w-full max-w-[750px]">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data.chartData}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
            />
            <YAxis domain={[0, 50]} tick={{ fontSize: 12 }} />
            <Tooltip labelFormatter={(label) => formatDate(label)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="score"
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
