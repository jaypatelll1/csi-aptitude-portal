import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const HorizontalBarChartComponent = ({ data }) => {
  return (
    <div className="flex flex-col items-center bg-transparent">
      <h2 className="text-xl font-medium text-[#1349C5] self-start">{data.title}</h2>
      <ResponsiveContainer width={360} height={300}>
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
            <Bar
              key={index}
              dataKey={key}
              fill={data.colors?.[key] || "#1349C5"}
              barSize={25}
              stackId="a"
              name={key}
            >
              <LabelList
                dataKey={key}
                position="right" // Changed from "top" since it's horizontal
                style={{ fill: "#000000", fontSize: "12px" }}
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HorizontalBarChartComponent;
