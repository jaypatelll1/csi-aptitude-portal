import React from "react";
import MSidebar from "../components/student/Home/MSidebar";
import Stu_TestCard from "../components/student/Home/Stu_TestCard";

function HomePage() {
  const testData = [
    {
      testName: "General Knowledge",
      questionCount: 40,
      duration: "30 min",
      lastDate: "20 Dec 2024",
    },
    {
      testName: "Science Quiz",
      questionCount: 30,
      duration: "20 min",
      lastDate: "15 Jan 2025",
    },
    {
      testName: "Mathematics Quiz",
      questionCount: 25,
      duration: "15 min",
      lastDate: "10 Jan 2025",
    },
    
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Component */}
      <div className="w-1/4">
        <MSidebar />
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6">
        {/* Grid Layout */}
        <div className="grid grid-cols-2 gap-3">
          {testData.map((test, index) => (
            <Stu_TestCard key={index} {...test} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
