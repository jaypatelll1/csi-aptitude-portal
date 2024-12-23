// Adm_PastTest.js
import React from "react";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar"; // Import the Sidebar
import Adm_PastTestCard from "../../components/admin/Adm_PastTestCard"; // Import the PastTestCard

const Adm_PastTest = () => {
  const pastTests = [
    { title: "Math Final Exam", date: "2024-12-01", questions: 50, duration: "2 hours" },
    { title: "Physics Test", date: "2024-11-25", questions: 40, duration: "1.5 hours" },
    // Add more past test data as needed
  ];

  return (
    <div className="flex">
      {/* Sidebar Component */}
      <Adm_Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 ml-64"> {/* Adjusted margin-left to give space for Sidebar */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6 font-sans">Past Tests</h1>
        <hr></hr>

        {/* Grid Layout for Past Test Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {pastTests.map((test, index) => (
            <Adm_PastTestCard key={index} test={test} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Adm_PastTest;
