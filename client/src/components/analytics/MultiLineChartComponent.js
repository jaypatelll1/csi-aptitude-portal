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
  const { title, chartData } = data;
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

  return (
    <div className="flex flex-col items-center  ">
     <h2 className="text-xl font-medium mb-4  text-[#1349C5]">{data.title}</h2>
      <div className="w-[750px] h-[200px]">
        <ResponsiveContainer width="100%" height={335}>
          <LineChart data={chartData} margin={{ top: 10,right: 25, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
            />
            <YAxis domain={[0, 50]} tick={{ fontSize: 12 }} />
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
                strokeWidth={selected.includes(dept) ? 2: 2}
                dot={{ r: selected.includes(dept) ? 2:2}}
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MultiLineChart;
