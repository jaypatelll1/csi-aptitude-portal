// Adm_PastTest.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar"; // Import the Sidebar
import Adm_PastTestCard from "../../components/admin/Adm_PastTestCard"; // Import the PastTestCard

const Adm_PastTest = () => {
  const [pastTests, setPastTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPastTests = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/exams/past"); // Replace with your actual API endpoint
        const { exams } = response.data;
        const formattedTests = exams.map((exam) => ({
          title: exam.exam_name,
          date: new Date(exam.created_at).toLocaleDateString(),
          questions: exam.duration, // Update if you have questions count in your API
          duration: `${exam.duration} minutes`,
        }));
        setPastTests(formattedTests);
      } catch (err) {
        console.error("Error fetching past tests:", err);
        setError("Failed to fetch past tests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPastTests();
  }, []);

  return (
    <div className="flex">
      {/* Sidebar Component */}
      <Adm_Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 ml-64"> {/* Adjusted margin-left to give space for Sidebar */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6 font-sans">Past Tests</h1>
        <hr />

        {loading && <p>Loading past tests...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* Grid Layout for Past Test Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {pastTests.map((test, index) => (
              <Adm_PastTestCard key={index} test={test} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Adm_PastTest;
