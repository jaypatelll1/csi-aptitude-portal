// Adm_ScheduledTest.js
import React from "react";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";  // Import the Sidebar
import Adm_ScheduledTestCard from "../../components/admin/Adm_ScheduleTestCard";  // Import the ScheduledTestCard

const Adm_ScheduledTest = () => {
  const scheduledTests = [
    { title: "Math Test", date: "2024-12-24", questions: 20, duration: "1 hour" },
    { title: "Science Test", date: "2024-12-25", questions: 25, duration: "1.5 hours" },
    // Add more test data as needed
  ];

  return (
    <div className="flex">
      {/* Sidebar Component */}
      {/* <div className="w-1/6"> */}
      <Adm_Sidebar />
      {/* </div> */}

      {/* Main Content */}
      <div className="flex-1 p-6 ml-64">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 font-sans">Scheduled Tests</h1>
        <hr></hr>
        {/* Grid Layout for Test Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {scheduledTests.map((test, index) => (
            <Adm_ScheduledTestCard key={index} test={test} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Adm_ScheduledTest;
