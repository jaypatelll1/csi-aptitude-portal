const pool = require('../config/db');
const { paginate } = require('../utils/pagination');

const createExam = async (exam) => {
  const { name, duration, created_by ,   formattedTargetYears,formattedTargetBranches } = exam;
  const query = `INSERT INTO exams (exam_name, duration, created_by, status , target_years, target_branches) VALUES ($1, $2, $3, $4,$5,$6) RETURNING  *`;
  const values = [name, duration, created_by, 'draft',formattedTargetYears,formattedTargetBranches  ];
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
const markLiveExam = async (exam_id) => {
  const query = `UPDATE exams SET status='live' WHERE exam_id=$1 RETURNING *`;
  const values = [exam_id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteExam = async (exam_id) => {

  
  // Step 1: Delete all related questions
  const deleteQuestionsQuery = `DELETE FROM questions WHERE exam_id=$1`;
  await pool.query(deleteQuestionsQuery, [exam_id]);

  // Step 2: Now delete the exam
  const query = `DELETE FROM exams WHERE exam_id=$1 RETURNING *`;
  const result = await pool.query(query, [exam_id]);
  
  // Return the deleted exam data
  return result.rows[0];
};

// Pagination
// Get all exams with pagination
const getAllPaginatedExams = async (page, limit) => {
  const query = 'SELECT * FROM exams ORDER BY exam_id ASC';
  const paginatedQuery = paginate(query, page, limit);
  const result = await pool.query(paginatedQuery);
  return result;
};
// count of differnt type of exams

const ExamCount = async (status) => {
  const queryTEXT = 'SELECT * FROM exams WHERE status=$1';
  let draft_count = null, scheduled_count = null, past_count = null, live_count = null;

  try {
    // Query for each status
    if (status === 'draft') {
      const result = await pool.query(queryTEXT, [status]);
      draft_count = result.rowCount || 0;
    }
    if (status === 'scheduled') {
      const result = await pool.query(queryTEXT, [status]);
      scheduled_count = result.rowCount || 0;
    }
    if (status === 'past') {
      const result = await pool.query(queryTEXT, [status]);
      past_count = result.rowCount || 0;
    }
    if (status === 'live') {
      const result = await pool.query(queryTEXT, [status]);
      live_count = result.rowCount || 0;
    }

    // Return the counts for each status
    return {
      draft: draft_count,
      scheduled: scheduled_count,
      past: past_count,
      live: live_count
    };
  } catch (error) {
    console.error("Error retrieving exam counts:", error);
    throw new Error("Failed to retrieve exam counts");
  }
};



const getAllScheduledExams = async () => {
  const query = 'SELECT * FROM exams WHERE status = $1';
  const result = await pool.query(query, ['scheduled']);
  return result.rows;
};

const getExamsByStatus = async (status) => {
  const query = 'SELECT * FROM exams WHERE status = $1 ORDER BY exam_id DESC';
  const result = await pool.query(query, [status]);
  return result.rows;
}





const getPaginatedExams = async (page, limit , status) => {
  const query = `SELECT 
    e.exam_id, 
    e.exam_name, 
e.duration,
e.start_time,
e.end_time,
e.created_at,
e.status,
    COUNT(q.question_id) AS question_count
FROM 
    exams e
LEFT JOIN 
    questions q
ON 
    e.exam_id = q.exam_id
WHERE 
    e.status = $1
GROUP BY 
    e.exam_id, e.exam_name 
   ORDER BY created_at DESC`;
  const paginatedQuery = paginate(query, page, limit);
  const result = await pool.query(paginatedQuery, [status]);
  return result.rows;
};
// const getPaginatedLiveExams = async (page, limit) => {
//   const query = `SELECT 
//     e.exam_id, 
//     e.exam_name, 
// e.duration,
// e.start_time,
// e.end_time,
// e.created_at,
//     COUNT(q.question_id) AS question_count
// FROM 
//     exams e
// LEFT JOIN 
//     questions q
// ON 
//     e.exam_id = q.exam_id
// WHERE 
//     e.status = $1
// GROUP BY 
//     e.exam_id, e.exam_name`;
//   const paginatedQuery = paginate(query, page, limit);
//   const result = await pool.query(paginatedQuery, ['live']);
//   return result.rows;
// }

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
  getPaginatedExams,
  // getPaginatedDraftededExams,
  getAllScheduledExams,
  // getPaginatedScheduledExams,
  // getPaginatedPastExams,
  // getPaginatedLiveExams,
  scheduleExam,
  markLiveExam,
  markPastExam,
  getLastExam,
  getExamsByStatus,
  ExamCount
};
