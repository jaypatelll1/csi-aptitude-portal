import React from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const RadarChartComponent = ({ data }) => {
  if (!data || !data.chartData || data.chartData.length === 0) {
    return <p className="text-center text-gray-500">No Data Available</p>;
  }

  // Preprocess data to add line breaks
  const processedData = data.chartData.map(item => ({
    ...item,
    name: item.name.replace(" ", "\n"), // Replace space with newline (e.g., "general knowledge" -> "general\nknowledge")
  }));

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-medium mb-4 text-[#1349C5]">{data.title}</h2>
      <ResponsiveContainer  width={500} height={350}>
        <RadarChart cx="50%" cy="50%" outerRadius="85%" data={processedData}>
          <PolarGrid />
          <PolarAngleAxis
            dataKey="name"
            tick={(props) => {
              const { x, y, textAnchor, payload } = props;
              const value = payload?.value || "N/A"; // Fallback for undefined value

              // Calculate the angle and offset the position by 10px
              const angle = Math.atan2(y - 150, x - 350); // Center at (350, 150)
              const offset = 10; // 10px distance
              const newX = x + offset * Math.cos(angle);
              const newY = y + offset * Math.sin(angle);

              return (
                <text
                  x={newX}
                  y={newY}
                  textAnchor={textAnchor}
                  style={{ fontSize: "14px" }}
                >
                  {value.split("\n").map((line, i) => (
                    <tspan key={i} x={newX} dy={i * 12}>
                      {line}
                    </tspan>
                  ))}
                </text>
              );
            }}
          />
          <PolarRadiusAxis />
          <Tooltip />
          <Radar dataKey="yourScore" stroke="#1349C5" fill="#1349C5" fillOpacity={0.6} />
          <Radar dataKey="averagePercentage" stroke="#6A88F7" fill="#6A88F7" fillOpacity={0.4} />
          <Radar dataKey="maxMarks" stroke="#D3D3D3" fill="#D3D3D3" fillOpacity={0.3} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChartComponent;