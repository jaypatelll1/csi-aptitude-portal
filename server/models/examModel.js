const pool = require('../config/db');
const { paginate } = require('../utils/pagination');

const createExam = async (exam) => {
  const { name, duration, start_time, end_time, created_by } = exam;
  const query = `INSERT INTO exams (exam_name, duration, start_time, end_time, created_by, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
  const values = [name, duration, start_time, end_time, created_by, 'draft'];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getExams = async () => {
  const query = `SELECT * FROM exams`;
  const result = await pool.query(query);
  return result.rows;
};

const getExamById = async (exam_id) => {
  const query = 'SELECT * FROM exams WHERE exam_id = $1';
  const values = [exam_id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const updateExam = async (exam) => {
  const { exam_id, name, duration, start_time, end_time, created_by } = exam;
  const query = `UPDATE exams SET exam_name=$1, duration=$2, start_time=$3, end_time=$4, created_by=$5, status=$6 WHERE exam_id=$6 RETURNING *`;
  const values = [
    name,
    duration,
    start_time,
    end_time,
    created_by,
    exam_id,
    'draft',
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const scheduleExam = async (exam_id) => {
  const query = `UPDATE exams SET status='scheduled' WHERE exam_id=$1 RETURNING *`;
  const values = [exam_id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const markPastExam = async (exam_id) => {
  const query = `UPDATE exams SET status='past' WHERE exam_id=$1 RETURNING *`;
  const values = [exam_id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteExam = async (exam) => {
  const { exam_id } = exam;
  const query = `DELETE FROM exams WHERE exam_id=$1 RETURNING *`;
  const result = await pool.query(query, [exam_id]);
  return result.rows[0];
};

// Pagination
// Get all exams with pagination
const getAllPaginatedExams = async (page, limit) => {
  const query = 'SELECT * FROM exams';
  const paginatedQuery = paginate(query, page, limit);
  const result = await pool.query(paginatedQuery);
  return result.rows;
};

const getPaginatedPublishedExams = async (page, limit) => {
  const query = 'SELECT * FROM exams WHERE status=$1';
  const paginatedQuery = paginate(query, page, limit);
  const result = await pool.query(paginatedQuery, ['scheduled']);
  return result.rows;
};

const getPaginatedDraftededExams = async (page, limit) => {
  const query = 'SELECT * FROM exams WHERE status=$1';
  const paginatedQuery = paginate(query, page, limit);
  const result = await pool.query(paginatedQuery, ['draft']);
  return result.rows;
};

const getPaginatedPastExams = async (page, limit) => {
  const query = 'SELECT * FROM exams WHERE status=$1';
  const paginatedQuery = paginate(query, page, limit);
  const result = await pool.query(paginatedQuery, ['past']);
  return result.rows;
};

module.exports = {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  getAllPaginatedExams,
  getPaginatedDraftededExams,
  getPaginatedPublishedExams,
  getPaginatedPastExams,
  scheduleExam,
  markPastExam,
};
