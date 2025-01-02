const pool = require('../config/db');
const { paginate } = require('../utils/pagination');

const createExam = async (exam) => {
  const { name, duration, created_by } = exam;
  const query = `INSERT INTO exams (exam_name, duration, created_by, status) VALUES ($1, $2, $3, $4) RETURNING *`;
  const values = [name, duration, created_by, 'draft'];
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
  const { exam_id, name, duration, start_time, end_time, created_by ,status } = exam;
  const query = `UPDATE exams SET exam_name=$1, duration=$2, start_time=$3, end_time=$4, created_by=$5, status=$6 WHERE exam_id=$7 RETURNING *`;
  const values = [
    name,
    duration,
    start_time,
    end_time,
    created_by,
    status,
    exam_id
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const scheduleExam = async (exam_id, start_time, end_time) => {
  const query = `UPDATE exams SET start_time=$1, end_time=$2, status=$3 WHERE exam_id=$4 RETURNING *`;
  const values = [start_time, end_time, 'scheduled', exam_id];
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
  const query = 'SELECT * FROM exams ORDER BY exam_id ASC';
  const paginatedQuery = paginate(query, page, limit);
  const result = await pool.query(paginatedQuery);
  return result.rows;
};

const getAllScheduledExams = async () => {
  const query = 'SELECT * FROM exams WHERE status = $1';
  const result = await pool.query(query, ['scheduled']);
  return result.rows;
};

const getPaginatedScheduledExams = async (page, limit) => {
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
const getPaginatedLiveExams = async (page, limit) => {
  const query = 'SELECT * FROM exams WHERE status=$1';
  const paginatedQuery = paginate(query, page, limit);
  const result = await pool.query(paginatedQuery, ['live']);
  return result.rows;
}

const getLastExam = async () => {
  const query = 'SELECT * FROM exams ORDER BY created_at DESC LIMIT 1';
  const result = await pool.query(query);
  return result.rows[0];
};

module.exports = {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  getAllPaginatedExams,
  getPaginatedDraftededExams,
  getAllScheduledExams,
  getPaginatedScheduledExams,
  getPaginatedPastExams,
  getPaginatedLiveExams,
  scheduleExam,
  markPastExam,
  getLastExam
};
