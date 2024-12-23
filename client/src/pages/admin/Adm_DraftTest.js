import React from "react";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";  // Import the Sidebar component
import Adm_DraftedTestCard from "../../components/admin/Adm_DraftedTestCard"; // Import the Drafted Test Card

const Adm_DraftTest = () => {
  // Data you want to pass to Adm_DraftedTestCard
  const tests = [
    { title: "Logical reasoning", questions: 40, duration: "30 min", date: "20 Dec 2024" },
    { title: "Quantitative Aptitude", questions: 50, duration: "45 min", date: "18 Dec 2024" },
    { title: "Verbal Ability", questions: 30, duration: "25 min", date: "15 Dec 2024" },
    { title: "Data Interpretation", questions: 35, duration: "40 min", date: "14 Dec 2024" },
  ];

  return (
    <div className="flex">
      {/* Sidebar Section */}
      {/* <div className="w-1/6"> */}
        <Adm_Sidebar /> {/* Sidebar component on the left */}
      {/* </div> */}

      {/* Main Content Section */}
      <div className="flex-1 p-6 ml-64">
        <h1 className="text-2xl font-bold mb-6 font-sans">Drafted Tests</h1>
        <hr></hr>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* Map through the test data and pass each test to Adm_DraftedTestCard */}
          {tests.map((test, index) => (
            <Adm_DraftedTestCard key={index} test={test} /> 
          ))}
        </div>
      </div>
    </div>
  );
};

export default Adm_DraftTest;
