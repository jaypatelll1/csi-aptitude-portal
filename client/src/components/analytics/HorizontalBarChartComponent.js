import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const HorizontalBarChartComponent = ({ data }) => {
  return (
    <div className="flex flex-col items-center bg-transparent">
      <h2 className="text-xl font-medium mb-4 text-[#1349C5]">{data.title}</h2>
      <ResponsiveContainer width={400} height={300}>
        <BarChart
          layout="vertical"
          data={data.chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barCategoryGap={0} // Overlapping bars
        >
          <XAxis type="number" />
          <YAxis dataKey={data.yKey} type="category" width={100} />
          <Tooltip />
          <Legend />
          {data.xKey.map((key, index) => (
            <Bar key={index} dataKey={key} fill={data.colors?.[key] || "#1349C5"} barSize={25} stackId="a" name={key} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HorizontalBarChartComponent;
