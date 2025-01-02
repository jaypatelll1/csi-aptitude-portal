import React, { useEffect, useState } from "react";
import axios from "axios";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar"; 
import Adm_ScheduledTestCard from "../../components/admin/Adm_ScheduleTestCard"; 

const Adm_ScheduledTest = () => {
  const [scheduledTests, setScheduledTests] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  useEffect(() => {
    const fetchScheduledTests = async () => {
      try {
        setLoading(true); // Set loading to true before fetching
        setError(null); // Clear any existing errors

        const response = await axios.get(
          "/api/exams/draftes", // Replace with your API endpoint
          {
            withCredentials: true,
          }
        );

        const fetchedTests = response.data.exams.map((exam) => ({
          title: exam.exam_name || "Untitled Exam",
          date: exam.start_time ? new Date(exam.start_time).toLocaleDateString() : "N/A",
          questions: exam.questions_count || "N/A", // Assuming `questions_count` exists
          duration: exam.duration ? `${exam.duration} min` : "N/A",
        }));

        setScheduledTests(fetchedTests);
      } catch (err) {
        setError("Failed to load scheduled tests. Please try again later.");
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchScheduledTests();
  }, []);

  return (
    <div className="flex">
      {/* Sidebar Section */}
      <Adm_Sidebar />

      {/* Main Content Section */}
      <div className="flex-1 p-6 ml-64">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 font-sans">Scheduled Tests</h1>
        <hr />
        {loading ? (
          <p>Loading scheduled tests...</p> 
        ) : error ? (
          <p className="text-red-500">{error}</p>    
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {scheduledTests.map((test, index) => (
              <Adm_ScheduledTestCard key={index} test={test} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Adm_ScheduledTest;
