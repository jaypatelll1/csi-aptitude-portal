const pool = require('../config/db');
const format = require('pg-format');
const { paginate } = require('../utils/pagination');

const deleteExistingResponses = async (exam_id, teacher_id) => {
  if (!exam_id || !teacher_id) {
    throw new Error(
      'Both exam_id and teacher_id are required to delete responses.'
    );
  }

  const query = `DELETE FROM teacher_responses WHERE exam_id = $1 AND teacher_id = $2;`;
  const values = [exam_id, teacher_id];

  try {
    const result = await pool.query(query, values);
    console.log(
      `Deleted ${result.rowCount} response(s) for exam_id: ${exam_id}, teacher_id: ${teacher_id}`
    );
    return { success: true, deletedRows: result.rowCount };
  } catch (error) {
    console.error('Error deleting teacher responses:', error);
    throw new Error('Failed to delete teacher responses. Please try again.');
  }
};

// Submit multiple responses
const submitMultipleResponses = async (responses) => {
  // Prepare values for bulk insert
  const values = responses.map((response) => [
    response.exam_id,
    response.question_id,
    response.teacher_id,
    response.selected_option,
    response.selected_options,
    response.text_answer,
    response.question_type,
  ]);

  // Generate placeholders for parameterized query
  const placeholders = values
    .map(
      (_, i) =>
        `($${i * 7 + 1}, $${i * 7 + 2}, $${i * 7 + 3}, $${i * 7 + 4}, $${i * 7 + 5}, $${i * 7 + 6}, $${i * 7 + 7})`
    )
    .join(', ');

  // Flatten the values array for parameterized query
  const flattenedValues = values.flat();

  const query = format(`
    INSERT INTO teacher_responses (exam_id, question_id, teacher_id, selected_option, selected_options, text_answer, question_type)
    VALUES ${placeholders}
    RETURNING *;
  `);

  const result = await pool.query(query, flattenedValues);
  return result.rows;
};

// Insert 'NULL' in unanswered questions
// Initialize all responses for an exam when a user starts an exam
const submittedUnansweredQuestions = async (exam_id, teacher_id) => {
  const query = `
    SELECT question_id, question_type
    FROM questions
    WHERE exam_id = $1
    AND question_id NOT IN (
      SELECT question_id
      FROM teacher_responses
      WHERE exam_id = $1
      AND teacher_id = $2
    )
  `;
  const result = await pool.query(query, [exam_id, teacher_id]);
  const unansweredQuestions = result.rows.map((row) => ({
    exam_id,
    question_id: row.question_id,
    teacher_id,
    selected_option: null,
    selected_options: null,
    text_answer: null,
    question_type: row.question_type,
  }));

  if (unansweredQuestions.length > 0) {
    return submitMultipleResponses(unansweredQuestions);
  }
  return result.rows;
};

// Submit a response
const submitTeacherResponse = async (
  teacher_id,
  exam_id,
  question_id,
  selected_option,
  selected_options,
  text_answer,
  question_type,
  response_status
) => {
  let query, values;

  if (question_type === 'single_choice') {
    query = `
      UPDATE teacher_responses SET selected_option=$1, selected_options=null, text_answer=null, response_status=$2 WHERE exam_id=$3 AND question_id=$4 AND teacher_id=$5 AND question_type=$6 RETURNING *;
    `;
    values = [
      selected_option,
      response_status,
      exam_id,
      question_id,
      teacher_id,
      question_type,
    ];
  } else if (question_type === 'multiple_choice') {
    query = `
      UPDATE teacher_responses SET selected_option=null, selected_options=$1::jsonb , text_answer=null, response_status=$2 WHERE exam_id=$3 AND question_id=$4 AND teacher_id=$5 AND question_type=$6 RETURNING *;
    `;
    values = [
      JSON.stringify(selected_options),
      response_status,
      exam_id,
      question_id,
      teacher_id,
      question_type,
    ];
  } else if (question_type === 'text') {
    query = `
      UPDATE teacher_responses SET selected_option=null, selected_options=null, text_answer=$1, response_status=$2 WHERE exam_id=$3 AND question_id=$4 AND teacher_id=$5 AND question_type=$6 RETURNING *;
    `;
    values = [
      text_answer,
      response_status,
      exam_id,
      question_id,
      teacher_id,
      question_type,
    ];
  } else {
    // Handle unsupported question type
    throw new Error(`Unsupported question_type: ${question_type}`);
  }

  // Check if query is defined before executing
  if (!query) {
    throw new Error(`No query defined for question_type: ${question_type}`);
  }

  const result = await pool.query(query, values);
  console.log(result.rows);
  return result.rows[0];
};

const submitFinalTeacherResponsesAndChangeStatus = async (
  teacher_id,
  exam_id
) => {
  const query = `
        UPDATE teacher_responses
        SET response_status = $1, answered_at = NOW()
        WHERE exam_id = $2 AND teacher_id = $3
        RETURNING *;
    `;
  const result = await pool.query(query, ['submitted', exam_id, teacher_id]);
  return result.rows;
};

const getExamIdByResponse = async (status, user_id) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT exam_id FROM teacher_responses 
         WHERE teacher_id = $1 AND response_status = $2`,
      [user_id, status]
    );

    // Return only the exam_id array
    return result.rows.map((row) => row.exam_id);
  } catch (error) {
    console.error(error);
    return error;
  }
};

// Function to clear a user's response for a specific question
const clearResponse = async (teacherId, examId, questionId) => {
  try {
    const result = await pool.query(
      "UPDATE responses SET selected_option = NULL, selected_options=NULL, text_answer=NULL WHERE teacher_id = $1 AND exam_id = $2 AND question_id = $3 AND response_status='draft' RETURNING *",
      [teacherId, examId, questionId]
    );
    return result.rows;
  } catch (error) {
    console.error(error);
  }
};

const getPaginatedResponses = async (teacher_id, exam_id, page, limit) => {
  let query = 
   `SELECT response_id, selected_option, selected_options, text_answer, q.question_type, answered_at, teacher_responses.question_id, q.question_text,q.options  
    FROM teacher_responses
    INNER JOIN questions AS q ON teacher_responses.question_id = q.question_id
    WHERE q.exam_id = $1 AND teacher_responses.teacher_id = $2
    order by response_id`;

  const values = [exam_id, teacher_id];

  if (page && limit) {
    query = paginate(query, page, limit); // Use pagination function
  }

  const result = await pool.query(query, values);
  return result.rows;
};

module.exports = {
  deleteExistingResponses,
  submittedUnansweredQuestions,
  submitTeacherResponse,
  submitFinalTeacherResponsesAndChangeStatus,
  getExamIdByResponse,
  clearResponse,
  getPaginatedResponses
};
