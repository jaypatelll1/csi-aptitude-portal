

const { query } = require("../config/db");
require("dotenv").config();

const  viewResult = async (exam_id) => {
  try {
    const queryText =`SELECT 
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
    r.exam_id = $1`
    const res = await query(queryText,[exam_id]);
    // console.log('Results:', res.rows);
        return res.rows;
  } catch (error) {
    console.error('Error executing query:', error);
  }
}

module.exports = {viewResult}