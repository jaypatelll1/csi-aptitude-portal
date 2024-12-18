const {query} = require('../config/db3');

// CREATE: Insert a new result
async function createResult(studentId, examId, totalScore, maxScore, completedAt) {
    const queryText = `
      INSERT INTO results (student_id, exam_id, total_score, max_score, completed_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [studentId, examId, totalScore, maxScore, completedAt];
  
    try {
      const res = await query(queryText, values);
      console.log('Result created:', res.rows[0]);
      return res.rows[0];
    } catch (err) {
      console.error('Error creating result:', err);
    }
  }
  



// READ: Fetch all results
async function getAllResults() {
    const queryText = 'SELECT * FROM results;';
  
    try {
      const res = await query(queryText);
      console.log('All results:', res.rows);
      return res.rows;
    } catch (err) {
      console.error('Error fetching results:', err);
    }
  }

  // READ: Fetch a single result by ID
async function getResultById(resultId) {
    const queryText = 'SELECT * FROM results WHERE result_id = $1;';
    const values = [resultId];
  
    try {
      const res = await query(queryText, values);
      console.log('Result:', res.rows[0]);
      return res.rows[0];
    } catch (err) {
      console.error('Error fetching result:', err);
    }
  }

  // READ: Fetch a single result by ID
async function getResultById(resultId) {
  const queryText = 'SELECT * FROM results WHERE result_id = $1;';
  const values = [resultId];

  try {
    const res = await query(queryText, values);
    console.log('Result:', res.rows[0]);
    return res.rows[0];
  } catch (err) {
    console.error('Error fetching result:', err);
  }
}

// UPDATE: Update a result
async function updateResult(resultId, totalScore, maxScore, completedAt) {
  const queryText = `
    UPDATE results
    SET total_score = $1, max_score = $2, completed_at = $3
    WHERE result_id = $4
    RETURNING *;
  `;
  const values = [totalScore, maxScore, completedAt, resultId];

  try {
    const res = await query(queryText, values);
    console.log('Updated result:', res.rows[0]);
    return res.rows[0];
  } catch (err) {
    console.error('Error updating result:', err);
  }
}

// DELETE: Delete a result
async function deleteResult(resultId) {
  const queryText = 'DELETE FROM results WHERE result_id = $1 RETURNING *;';
  const values = [resultId];

  try {
    const res = await query(queryText, values);
    console.log('Deleted result:', res.rows[0]);
    return res.rows[0];
  } catch (err) {
    console.error('Error deleting result:', err);
  }
}

module.exports={
    createResult,
    getAllResults,
    getResultById,
    updateResult,
    deleteResult
}