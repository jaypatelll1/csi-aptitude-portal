const { query } = require('../config/db');
const { paginate } = require('../utils/pagination');
const { calculateAndStoreTotalScore } = require('../utils/scoreUtils');

// CREATE: Insert a new result
async function createResult() {
  try {
const result = await calculateAndStoreTotalScore();


for (const rows of result) {
  const { student_id, exam_id, correct_responses, max_score } = rows ;
  const completed_at =new Date().toISOString();

  const queryText = `
      INSERT INTO results (student_id, exam_id, total_score, max_score, completed_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [student_id, exam_id, correct_responses, max_score, completed_at];
    await query(queryText, values);

}

  } catch (err) {
    console.error('Error creating result:', err);
  }
}

// READ: Fetch all results
async function getAllResults(student_id) {
  const queryText = 'SELECT * FROM results WHERE student_id=$1;';

  try {
    const res = await query(queryText, [student_id]);
    return res.rows;
  } catch (err) {
    console.error('Error fetching results:', err);
  }
}

// READ: Fetch a single result by ID
async function getResultById(exam_id, student_id) {
  const queryText =
    'SELECT * FROM results WHERE exam_id = $1 AND student_id=$2;';
  const values = [exam_id, student_id];

  try {
    const res = await query(queryText, values);
    if (res.rows.length === 0) {
      return 'No Result Found';
    }
    return res.rows[0];
  } catch (err) {
    console.error('Error fetching result:', err);
  }
}

// UPDATE: Update a result
async function updateResult(result) {
  const { total_score, max_score, completed_at, exam_id, student_id } = result;
  const queryText = `
    UPDATE results
    SET total_score = $1, max_score = $2, completed_at = $3
    WHERE exam_id = $4 AND student_id=$5
    RETURNING *;
  `;
  const values = [total_score, max_score, completed_at, exam_id, student_id];

  try {
    const res = await query(queryText, values);
    console.log('Updated result:', res.rows[0]);
    return res.rows[0];
  } catch (err) {
    console.error('Error updating result:', err);
  }
}

// DELETE: Delete a result
async function deleteResult(exam_id) {
  const queryText = 'DELETE FROM results WHERE exam_id = $1 RETURNING *;';
  const values = [exam_id];

  try {
    const res = await query(queryText, values);
    console.log('Deleted result:', res.rows[0]);
    return res.rows[0];
  } catch (err) {
    console.error('Error deleting result:', err);
  }
}

// Pagination
// Get all results for a specific exam with pagination
const getPaginatedResultsByExam = async (exam_id, page, limit) => {
  const query = `SELECT * FROM results WHERE exam_id=${exam_id}`;
  const paginatedqueryText = paginate(query, page, limit);
  const result = await query(paginatedqueryText);
  return result.rows;
};

module.exports = {
  createResult,
  getAllResults,
  getResultById,
  updateResult,
  deleteResult,
  getPaginatedResultsByExam,
};
