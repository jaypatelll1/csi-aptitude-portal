const pool = require('../config/db');

// CREATE: Insert a new result
async function createResult(result) {
  const {  student_id, exam_id, total_score, max_score, completed_at } = result;
  const query = `
      INSERT INTO results (student_id, exam_id, total_score, max_score, completed_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
  const values = [ student_id, exam_id, total_score, max_score, completed_at];

  try {
    const res = await pool.query(query, values);
    console.log('Result created:', res.rows[0]);
    return res.rows[0];
  } catch (err) {
    console.error('Error creating result:', err);
  }
}

// READ: Fetch all results
async function getAllResults(student_id) {
  const query = 'SELECT * FROM results WHERE student_id=$1;';

  try {
    const res = await pool.query(query, [student_id]);
    console.log('All results:', res.rows);
    return res.rows;
  } catch (err) {
    console.error('Error fetching results:', err);
  }
}

// READ: Fetch a single result by ID
async function getResultById(exam_id, student_id) {
  const query = 'SELECT * FROM results WHERE exam_id = $1 AND student_id=$2;';
  const values = [exam_id, student_id];

  try {
    const res = await pool.query(query, values);
    console.log('Result:', res.rows[0]);
    if(res.rows.length === 0){
      return "No Result Found"
    }
    return res.rows[0];
  } catch (err) {
    console.error('Error fetching result:', err);
  }
}

// UPDATE: Update a result
async function updateResult(result) {
  const { total_score, max_score, completed_at, exam_id, student_id } = result
  const query = `
    UPDATE results
    SET total_score = $1, max_score = $2, completed_at = $3
    WHERE exam_id = $4 AND student_id=$5
    RETURNING *;
  `;
  const values = [total_score, max_score, completed_at, exam_id, student_id];

  try {
    const res = await pool.query(query, values);
    console.log('Updated result:', res.rows[0]);
    return res.rows[0];
  } catch (err) {
    console.error('Error updating result:', err);
  }
}

// DELETE: Delete a result
async function deleteResult(exam_id) {
  const query = 'DELETE FROM results WHERE exam_id = $1 RETURNING *;';
  const values = [exam_id];

  try {
    const res = await pool.query(query, values);
    console.log('Deleted result:', res.rows[0]);
    return res.rows[0];
  } catch (err) {
    console.error('Error deleting result:', err);
  }
}

module.exports = {
  createResult,
  getAllResults,
  getResultById,
  updateResult,
  deleteResult,
};
