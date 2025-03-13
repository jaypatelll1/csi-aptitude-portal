import React, { useState } from "react";
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

const MultiLineChart = ({ data }) => {
  const { chartData } = data;
  const departments = ["CMPN", "EXTC", "ECS", "ELEC", "INFT"];
  const [selected, setSelected] = useState([]);

  const handleLegendClick = (dept) => {
    setSelected((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
  };

  // Custom XAxis tick component (from LineChartComponent)
  const CustomTick = (props) => {
    const { x, y, payload } = props;
    const words = formatDate(payload.value).split("-"); // Split formatted date
    return (
      <text x={x} y={y + 10} textAnchor="middle" fill="#333" fontSize="14">
        {words.map((word, index) => (
          <tspan key={index} x={x} dy={index * 15}>
            {word}
          </tspan>
        ))}
      </text>
    );
  };

  // Custom label component for data points (from LineChartComponent)
  const CustomLabel = (props) => {
    const { x, y, value, index, dataKey } = props;
    // Only show label if the department is selected
    if (!selected.includes(dataKey) && selected.length > 0) return null;
    return (
      <text
        x={x}
        y={y - 10} // Position above the point
        textAnchor="middle"
        fill="#666"
        fontSize="12"
      >
        {value}
      </text>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-medium text-[#1349C5] self-start">{data.title}</h2>
      <div className="w-[750px] h-[200px]">
        <ResponsiveContainer width="100%" height={335}>
          <LineChart data={chartData} margin={{ top: 10, right: 25, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis
              dataKey="date"
              tick={<CustomTick />} // Use custom tick instead of tickFormatter
            />
            <YAxis domain={[0, 150]} tick={{ fontSize: 12 }} />
            <Tooltip labelFormatter={(label) => formatDate(label)} />
            <Legend
              onClick={(e) => handleLegendClick(e.value)}
              wrapperStyle={{ cursor: "pointer" }}
            />
            {departments.map((dept) => (
              <Line
                key={dept}
                type="monotone"
                dataKey={dept}
                stroke={selected.includes(dept) ? "#1349C5" : "#D3D3D3"}
                strokeWidth={selected.includes(dept) ? 2 : 2}
                dot={{ r: selected.includes(dept) ? 2 : 2 }}
                activeDot={{ r: 8 }}
                label={<CustomLabel />} // Add custom labels to each line
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MultiLineChart;