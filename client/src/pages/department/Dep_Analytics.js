import React from "react";
import DepartmentRanking from "../../components/analytics/DepartmentRanking"; 
import PerformanceComponent from "../../components/analytics/PerformanceComponent";

function Dep_Analytics() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Department Analytics</h1>
      <DepartmentRanking />
      <PerformanceComponent/>
    </div>
  );
}

export default Dep_Analytics;
