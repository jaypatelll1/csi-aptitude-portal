const { query } = require("../config/db");
require("dotenv").config();
const { paginate } = require('../utils/pagination');

const viewResult = async (exam_id, page = 1, limit = 10) => {
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
          r.exam_id
      FROM 
          results r
      JOIN 
          users u ON r.student_id = u.user_id
      WHERE 
          r.exam_id = $1
    `;

    // Apply pagination
    queryText = paginate(queryText, page, limit);

    // Execute query
    const result = await query(queryText, [exam_id]);

    // Calculate status for each result
    const resultsWithStatus = result.rows.map((row) => {
      const percentage = (row.total_score / row.max_score) * 100;
      return {
        ...row,
        percentage: percentage.toFixed(2), // Include the calculated percentage
        status: percentage >= 35, // Pass if percentage >= 35
      };
    });

    return resultsWithStatus;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error; // Rethrow error for higher-level handling
  }
};

module.exports = { viewResult };
