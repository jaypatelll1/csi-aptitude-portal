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
const markLiveExam = async (exam_id) => {
  const query = `UPDATE exams SET status='live' WHERE exam_id=$1 RETURNING *`;
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

  return {
    totalExams,
    exams: result.rows
  };
};

const getAllScheduledExams = async () => {
  const query = 'SELECT * FROM exams WHERE status = $1';
  const result = await pool.query(query, ['scheduled']);
  return result.rows;
};

const getExamsByStatus = async (status) => {
  const query = `SELECT DISTINCT 
    e.exam_id, 
    e.exam_name, 
e.duration,
e.start_time,
e.end_time,
e.created_at,
e.status,
e.target_branches,
e.target_years,
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
  const result = await pool.query(query, [status]);
  return result.rows;
}

const getExamsForUser = async (status, target_branches, target_years) => {
  try {
    const queryTEXT = `
       SELECT DISTINCT
  e.exam_id,
  e.exam_name,
  e.status,
  e.target_branches,
  e.target_years,
  e.duration,
  e.created_at,
  e.start_time,
  e.end_time,
  COUNT(q.exam_id) AS total_questions  
FROM exams AS e
JOIN questions AS q ON q.exam_id = e.exam_id
WHERE 
  e.status = $1                         
  AND e.target_branches @> $2::branch_enum[]  
  AND e.target_years @> $3::year_enum[]      
GROUP BY e.exam_id, e.status, e.target_branches, e.target_years  
ORDER BY e.exam_id DESC;                  
    `;

   
    const result = await pool.query(queryTEXT, [status, target_branches, target_years]);

    
    return result;
  } catch (error) {
    console.error('Error fetching exams:', error.message);
    throw error; // Re-throw the error for higher-level handling
  }
};





const getPaginatedExams = async (page, limit, status) => {

    const query = `SELECT DISTINCT
    e.exam_id, 
    e.exam_name, 
e.duration,
e.start_time,
e.end_time,
e.created_at,
e.status,
e.target_branches,
e.target_years,
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

}
  
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
  getPaginatedDraftededExams,
  getAllScheduledExams,
  getPaginatedScheduledExams,
  getPaginatedPastExams,
  getPaginatedLiveExams,
  scheduleExam,
  markLiveExam,
  markPastExam,
  getLastExam
};
