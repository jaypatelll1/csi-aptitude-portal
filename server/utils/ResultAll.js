const { query } = require("../config/db");
require("dotenv").config();
const { paginate } = require('../utils/pagination');

const ResultALL = async (exam_id, page = 1, limit = 10) => {
  try {
    // Base SQL query
    let queryText = `
      SELECT 
          u.name AS student_name,
          u.email AS student_email,
          r.total_score,
          r.max_score,
          r.completed_at,
          r.result_id,
          r.exam_id,
          e.duration,
          e.exam_name
      FROM 
          results r
      JOIN 
          users u ON r.student_id = u.user_id
      JOIN 
          exams e ON r.exam_id = e.exam_id
      WHERE 
          r.exam_id = $1
    `;

    // Apply pagination
   

    // Execute query
    const result = await query(queryText, [exam_id]);

    // Helper function to format date to readable format
    const formatToReadableDate = (isoString) => {
      const date = new Date(isoString);
      const options = { day: "2-digit", month: "short", year: "numeric" };
      return date.toLocaleDateString("en-IN", options);
    };

    // Calculate status for each result
    const resultsWithStatus = result.rows.map((row) => {
      const percentage = ((row.total_score / row.max_score) * 100); // Up to 3 decimal places
      const status = percentage >= 35 ? "Passed" : "Failed"; // Pass/Fail based on 35%
      return {
       
        student_name: row.student_name,
        student_email: row.student_email,
        total_score : row.total_score,
        max_score : row.max_score,
        duration : row.duration,
        exam_name : row.exam_name,
       Date: formatToReadableDate(row.completed_at), // Format date
        percentage: Number(percentage), // Include calculated percentage
        status :status, // Pass or Fail
      };
    });

    return resultsWithStatus;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error; // Rethrow error for higher-level handling
  }
};

module.exports = { ResultALL };
