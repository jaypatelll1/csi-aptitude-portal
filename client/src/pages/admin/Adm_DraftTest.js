import React, { useEffect, useState } from "react";
import axios from "axios";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar"; // Sidebar component
import Adm_DraftedTestCard from "../../components/admin/Adm_DraftedTestCard"; // Drafted Test Card component

const Adm_DraftTest = () => {
  const [tests, setTests] = useState([]); // State to store fetched drafted tests
  const [loading, setLoading] = useState(true); // State to track loading status
  const [error, setError] = useState(null); // State to track errors

  // Fetch drafted tests from the API
  useEffect(() => {
    const fetchDraftedTests = async () => {
      try {
        setLoading(true); // Set loading to true before fetching
        setError(null); // Clear any existing errors

        // Fetch data from the API
        const response = await axios.get(
          "/api/exams/drafts",
          {
            withCredentials: true, 
          }
        );

        const fetchedTests = response.data.exams.map((exam) => ({
          title: exam.exam_name || "Untitled Exam",
          questions: exam.questions_count || "N/A", // Assuming `questions_count` exists
          duration: exam.duration ? `${exam.duration} min` : "N/A",
          date: exam.start_time ? new Date(exam.start_time).toLocaleDateString() : "N/A",
        }));

        setTests(fetchedTests); 
      } catch (err) {
        setError("Failed to load drafted tests. Please try again later.");
      } finally {
        setLoading(false); 
      }
    };

    fetchDraftedTests();
  }, []);

  return (
    <div className="flex">
      {/* Sidebar Section */}
      <Adm_Sidebar />

      {/* Main Content Section */}
      <div className="flex-1 p-6 ml-64">
        <h1 className="text-2xl font-bold mb-6 font-sans">Drafted Tests</h1>
        <hr />
        {loading ? (
          <p>Loading drafted tests...</p> // Show loading indicator
        ) : error ? (
          <p className="text-red-500">{error}</p> // Show error message
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {/* Map through the test data and pass each test to Adm_DraftedTestCard */}
            {tests.map((test, index) => (
              <Adm_DraftedTestCard key={index} test={test} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Adm_DraftTest;
