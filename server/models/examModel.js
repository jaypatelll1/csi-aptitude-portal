const pool = require('../config/db');

const createExam = async (exam) => {
  const { name, duration, start_time, end_time, created_by } = exam;
  const query = `INSERT INTO exams (exam_name, duration, start_time, end_time, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
  const values = [name, duration, start_time, end_time, created_by];
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
  const query = `UPDATE exams SET exam_name=$1, duration=$2, start_time=$3, end_time=$4, created_by=$5 WHERE exam_id=$6 RETURNING *`;
  const values = [name, duration, start_time, end_time, created_by, exam_id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteExam = async (exam) => {
  const { exam_id } = exam;
  const query = `DELETE FROM exams WHERE exam_id=$1 RETURNING *`;
  const result = await pool.query(query, [exam_id]);
  return result.rows[0];
};

module.exports = { createExam, getExams, getExamById, updateExam, deleteExam };
