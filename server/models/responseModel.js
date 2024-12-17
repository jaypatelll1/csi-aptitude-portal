const pool = require('../config/db');

// Submit a response
const submitResponse = async ({
  exam_id,
  question_id,
  student_id,
  selected_option,
}) => {
  const query = `
      INSERT INTO responses (exam_id, question_id, student_id, selected_option)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
  const values = [exam_id, question_id, student_id, selected_option];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get responses by student for an exam
const getResponsesByStudent = async (exam_id, student_id) => {
  const query = `
      SELECT response_id, selected_option, answered_at, question_id,
      FROM responses
      JOIN questions ON questions.question_id = responses.question.id
      WHERE exam_id = $1 AND student_id = $2
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

module.exports = { submitResponse, getResponsesByStudent, getResponsesForExam, updateResponse, deleteResponse };
