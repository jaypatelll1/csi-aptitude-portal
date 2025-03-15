const { query } = require('../config/db');
const { paginate } = require('../utils/pagination');

// Function to create the Questions table if it doesn't exist
const createQuestionsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS questions (
      question_id SERIAL PRIMARY KEY,
      exam_id VARCHAR(255) NOT NULL,
      question_text TEXT NOT NULL,
      options JSONB NOT NULL,
      correct_option VARCHAR(255) NOT NULL,
      FOREIGN KEY (exam_id) REFERENCES Exams(exam_id) ON DELETE CASCADE
    );
  `;
};
const insertQuestion = async (
  exam_id,
  question_type,
  question_text,
  options,
  correct_option,
  correct_options,
  category_type,
  image_url
) => {
  const queryText = `
    INSERT INTO questions (exam_id, question_type, question_text, options, correct_option, correct_options, category, image_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
  `;

  const values = [
    exam_id,
    question_type,
    question_text,
    options,
    correct_option,
    correct_options,
    category_type,
    image_url,
  ];

  try {
    const res = await query(queryText, values);
    return res.rows[0]; // Return the inserted question
  } catch (err) {
    console.error('Error inserting question:', err.stack);
    throw err;
  }
};

// Function to get all questions for a given exam_id
const getQuestionsByExamId = async (exam_id) => {
  const queryText = 'SELECT * FROM questions WHERE exam_id = $1';
  const values = [exam_id];
  try {
    const res = await query(queryText, values);

    return res.rows; // Return the inserted question
  } catch (err) {
    console.error('Error inserting question: 12345', err.stack);
    throw err;
  }
};
const getStudentQuestionsByExamId = async (exam_id) => {
  const queryText =
    'SELECT question_id, exam_id, question_text, options, category, question_type, image_url FROM questions WHERE exam_id = $1';
  const values = [exam_id];
  try {
    const res = await query(queryText, values);

    return res.rows; // Return the inserted question
  } catch (err) {
    console.error('Error inserting question: 12345', err.stack);
    throw err;
  }
};

const UpdateQuestions = async (
  question_id,
  exam_id,
  question_type,
  question_text,
  options,
  correct_option,
  correct_options,
  category_type,
  image_url
) => {
  const queryText =
    'UPDATE questions SET question_text = $1, correct_option = $2, exam_id = $3, options = $4 , category = $6, question_type = $7, correct_options = $8, image_url = $9 WHERE question_id = $5 RETURNING *';
  const values = [
    question_text,
    correct_option,
    exam_id,
    options,
    question_id,
    category_type,
    question_type,
    correct_options,
    image_url,
  ];

  try {
    const res = await query(queryText, values);
    return res.rows[0]; // Return the inserted question
  } catch (err) {
    console.error('Error inserting question', err.stack);
    throw err;
  }
};

const DeleteQuestions = async (question_id) => {
  const queryText = 'DELETE FROM questions WHERE question_id = $1 RETURNING *';
  const values = [question_id];

  try {
    const res = await query(queryText, values);
    return res.rows[0]; // Return the deleted question
  } catch (err) {
    console.error('Error deleting question', err.stack);
    throw err;
  }
};

// Pagination
// Get all questions for a specific exam with pagination
const getPaginatedQuestionsByExam = async (exam_id, page, limit) => {
  const queryText = `SELECT * FROM questions WHERE exam_id = ${exam_id}`;
  const paginatedQuery = paginate(queryText, page, limit);
  const result = await query(paginatedQuery);
  return result.rows;
};

// // Update question with image URL
// async function updateQuestionImage(exam_id, question_id, image_url) {
//   const queryText = `UPDATE questions SET image_url = $1 WHERE exam_id = $2 AND question_id = $3 RETURNING *`;
//   const values = [image_url, exam_id, question_id];
//   const { rows } = await query(queryText, values);
//   return rows[0];
// }

// Function to get the question details before updating
async function getQuestionById(question_id) {
  const queryText = `SELECT * FROM questions WHERE question_id = $1`;
  const { rows } = await query(queryText, [question_id]);
  return rows.length > 0 ? rows[0] : null;
}

// Function to update the image URL (set NULL when deleting)
async function updateQuestionImage(question_id, image_url) {
  const queryText = `UPDATE questions SET image_url = $1 WHERE question_id = $2 RETURNING *`;
  const values = [image_url, question_id];

  const { rows } = await query(queryText, values);
  return rows[0];
}

module.exports = {
  createQuestionsTable,
  insertQuestion,
  getQuestionsByExamId,
  UpdateQuestions,
  DeleteQuestions,
  getPaginatedQuestionsByExam,
  getStudentQuestionsByExamId,
  getQuestionById,
  updateQuestionImage,
};
