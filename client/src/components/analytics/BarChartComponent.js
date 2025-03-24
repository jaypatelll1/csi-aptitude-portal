import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const BarChartComponent = ({ data }) => {
  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-xl font-medium text-[#1349C5] self-start mb-4">{data.title}</h2>
      <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[330px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.chartData}
            margin={{
              top: 20,
              right: 10,
              left: 0,
              bottom: 30,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={data.dataKey} tick={{ fontSize: 12 }} tickMargin={10} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} width={35} tickMargin={5} />
            <Tooltip cursor={{ fillOpacity: 0.1 }} />
            <Bar dataKey="score" fill="#1349C5" barSize={30} radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey="score"
                position="top"
                style={{ fill: "#000000", fontSize: "12px", fontWeight: "500" }}
                offset={10}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChartComponent;
