const pool = require('../config/db');
const format = require('pg-format');
const { paginate } = require('../utils/pagination');

// Delete Existing Responses
const deleteExistingResponses = async (exam_id, user_id) => {
  // console.log('exam_id, user_id',exam_id, user_id);
  
  const query = `DELETE FROM responses WHERE exam_id = $1 AND student_id = $2;`;
  const values = [exam_id, user_id];

  const result = await pool.query(query, values);
};

// Submit a response
const submitResponse = async (
  student_id,
  exam_id,
  question_id,
  selected_option,
  response_status
) => {
  const query = `
      UPDATE responses SET selected_option=$1, status=$2 WHERE exam_id=$3 AND question_id=$4 AND student_id=$5 RETURNING *;
    `;
  const values = [
    selected_option,
    response_status,
    exam_id,
    question_id,
    student_id,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Submit multiple responses
const submitMultipleResponses = async (responses) => {
  // Prepare values for bulk insert
  const values = responses.map((response) => [
    response.exam_id,
    response.question_id,
    response.student_id,
    response.selected_option,
  ]);

  // Generate placeholders for parameterized query
  const placeholders = values
    .map(
      (_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`
    )
    .join(', ');

  // Flatten the values array for parameterized query
  const flattenedValues = values.flat();

  const query = format(`
    INSERT INTO responses (exam_id, question_id, student_id, selected_option)
    VALUES ${placeholders}
    RETURNING *;
  `);

  const result = await pool.query(query, flattenedValues);
  return result.rows;
};

// Insert 'NULL' in unanswered questions
// Initialize all responses for an exam when a user starts an exam
const submittedUnansweredQuestions = async (exam_id, student_id) => {
  const query = `
    SELECT question_id
    FROM questions
    WHERE exam_id = $1
    AND question_id NOT IN (
      SELECT question_id
      FROM responses
      WHERE exam_id = $1
      AND student_id = $2
    )
  `;
  const result = await pool.query(query, [exam_id, student_id]);
  const unansweredQuestions = result.rows.map((row) => ({
    exam_id,
    question_id: row.question_id,
    student_id,
    selected_option: null,
  }));

  if (unansweredQuestions.length > 0) {
    return submitMultipleResponses(unansweredQuestions);
  }
  return result.rows;
};

const submitFinalResponsesAndChangeStatus = async (student_id, exam_id) => {
  const query = `
      UPDATE responses
      SET status = $1, answered_at = NOW()
      WHERE exam_id = $2 AND student_id = $3
      RETURNING *;
    `;
  const result = await pool.query(query, ['submitted', exam_id, student_id]);
  return result.rows;
};

// Get responses by student for an exam
const getResponsesByStudent = async (exam_id, student_id) => {
  const query = `
      SELECT response_id, selected_option, answered_at, responses.question_id
      FROM responses
      JOIN questions ON questions.question_id = responses.question_id
      WHERE responses.exam_id = $1 AND student_id = $2
    `;
  const result = await pool.query(query, [exam_id, student_id]);
  return result.rows;
};

// Get all responses for an exam
const getResponsesForExam = async (exam_id) => {
  const query = `
      SELECT response_id, selected_option, answered_at, student_id, question_id
      FROM responses
      JOIN questions ON questions.question_id = responses.question.id
      JOIN users ON users.user_id = responses.student_id
      WHERE exam_id = $1
    `;
  const result = await pool.query(query, [exam_id]);
  return result.rows;
};

// Update a response
const updateResponse = async (response_id, selected_option) => {
  const query = `
      UPDATE responses
      SET selected_option = $1, answered_at = NOW()
      WHERE response_id = $2
      RETURNING response_id, selected_option, answered_at;
    `;
  const values = [selected_option, response_id];

  const result = await pool.query(query, values);
  return result.rows[0]; // Return the updated response if found
};

// Delete a response
const deleteResponse = async (response_id) => {
  const query = `
      DELETE FROM responses
      WHERE response_id = $1
      RETURNING response_id;
    `;
  const values = [response_id];

  const result = await pool.query(query, values);
  return result.rowCount > 0; // Return true if a row was deleted
};

// Pagination
// Get paginated responses for a specific exam and student
const getPaginatedResponses = async (exam_id, student_id, page, limit) => {
  const query = `
  SELECT response_id, selected_option, answered_at, responses.question_id, question_text
  FROM responses
  INNER JOIN questions ON responses.question_id = questions.question_id
  WHERE questions.exam_id = ${exam_id}
  `;
  const paginatedQuery = paginate(query, page, limit);
  const result = await pool.query(paginatedQuery);
  return result.rows;
};

module.exports = {
  submitResponse,
  getResponsesByStudent,
  getResponsesForExam,
  updateResponse,
  deleteResponse,
  submitMultipleResponses,
  getPaginatedResponses,
  submittedUnansweredQuestions,
  submitFinalResponsesAndChangeStatus,
  deleteExistingResponses,
};