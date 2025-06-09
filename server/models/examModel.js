const pool = require('../config/db');
const { paginate } = require('../utils/pagination');

const createExam = async (exam) => {

  try {
    const { name, duration, created_by, formattedTargetYears, formattedTargetBranches, exam_for } = exam;
    const query = `INSERT INTO exams (exam_name, duration, created_by, status , target_years, target_branches, exam_for) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING  *`;
    const values = [name, duration, created_by, 'draft', formattedTargetYears, formattedTargetBranches, exam_for];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    console.error(err.name); // Output: RangeError
    console.error(err.message); // Output: Value must be a non-negative number.
  }

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
  const { exam_id, name, duration, start_time, end_time, created_by, status } = exam;
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

const ExamCount = async (status, role) => {
  if (role === "President" || role === "Teacher") {
    const queryTEXT = 'SELECT * FROM exams WHERE status=$1 AND exam_for = $2';
    let draft_count = null, scheduled_count = null, past_count = null, live_count = null;

    try {
      // Query for each status
      if (status === 'draft') {
        const result = await pool.query(queryTEXT, [status, "Teacher"]);
        draft_count = result.rowCount || 0;
      }
      if (status === 'scheduled') {
        const result = await pool.query(queryTEXT, [status, "Teacher"]);
        scheduled_count = result.rowCount || 0;
      }
      if (status === 'past') {
        const result = await pool.query(queryTEXT, [status, "Teacher"]);
        past_count = result.rowCount || 0;
      }
      if (status === 'live') {
        const result = await pool.query(queryTEXT, [status, "Teacher"]);
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
  } else {

    const queryTEXT = 'SELECT * FROM exams WHERE status=$1 AND exam_for = $2';
    let draft_count = null, scheduled_count = null, past_count = null, live_count = null;

    try {
      // Query for each status
      if (status === 'draft') {
        const result = await pool.query(queryTEXT, [status, 'Student']);
        draft_count = result.rowCount || 0;
      }
      if (status === 'scheduled') {
        const result = await pool.query(queryTEXT, [status, 'Student']);
        scheduled_count = result.rowCount || 0;
      }
      if (status === 'past') {
        const result = await pool.query(queryTEXT, [status, 'Student']);
        past_count = result.rowCount || 0;
      }
      if (status === 'live') {
        const result = await pool.query(queryTEXT, [status, 'Student']);
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
  }
};

const getAllScheduledExams = async () => {
  const query = 'SELECT * FROM exams WHERE status = $1';
  const result = await pool.query(query, ['scheduled']);
  return result.rows;
};

const getExamsByStatus = async (status, role, branch) => {
  const branchFilter = [branch]; // array format for @> operator

  if (role === "President" || role === "Teacher") {
    const query = `
      SELECT DISTINCT 
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
        questions q ON e.exam_id = q.exam_id
      WHERE 
        e.status = $1 AND 
        e.exam_for = $2 AND 
        e.target_branches @> $3::branch_enum[]
      GROUP BY 
        e.exam_id, e.exam_name 
      ORDER BY created_at DESC`;

    const result = await pool.query(query, [status, "Teacher", branchFilter]);
    return result.rows;
  }
  else if (role === "TPO") {
    const query = `
      SELECT DISTINCT 
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
        questions q ON e.exam_id = q.exam_id
      WHERE 
        e.status = $1 AND 
        e.exam_for = $2
      GROUP BY 
        e.exam_id, e.exam_name 
      ORDER BY created_at DESC`;

    const result = await pool.query(query, [status, "Student"]);
          console.log(result);
    return result.rows;
  }
  else {
    const query = `
      SELECT DISTINCT 
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
        questions q ON e.exam_id = q.exam_id
      WHERE 
        e.status = $1 AND 
        e.exam_for = $2 AND 
        e.target_branches @> $3::branch_enum[]
      GROUP BY 
        e.exam_id, e.exam_name 
      ORDER BY created_at DESC`;

    const result = await pool.query(query, [status, 'Student', branchFilter]);
    return result.rows;
  }
};


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
  e.status = $1 AND e.exam_for = 'Student'                     
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

const getExamsForTeachers = async (status) => {
  console.log(status)
  try {
    if (status === "all") {

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
LEFT JOIN questions AS q ON q.exam_id = e.exam_id
WHERE 
      e.status IN ('live','past','scheduled')
      AND 
  e.exam_for = 'Teacher'                              
GROUP BY e.exam_id, e.exam_name, e.status, e.target_branches, e.target_years, 
         e.duration, e.created_at, e.start_time, e.end_time  
ORDER BY e.exam_id DESC;`;


      const result = await pool.query(queryTEXT);

      console.log(result)
      return result;
    } else {
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
LEFT JOIN questions AS q ON q.exam_id = e.exam_id
WHERE 
  e.status = $1
  AND e.exam_for = 'Teacher'                              
GROUP BY e.exam_id, e.exam_name, e.status, e.target_branches, e.target_years, 
         e.duration, e.created_at, e.start_time, e.end_time  
ORDER BY e.exam_id DESC;`;


      const result = await pool.query(queryTEXT, [status]);


      return result;
    }
  } catch (error) {
    console.error('Error fetching exams:', error.message);
    throw error; // Re-throw the error for higher-level handling
  }
};




const getPaginatedExams = async (page, limit, status, role, branch) => {
  let query = `
    SELECT DISTINCT
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
      questions q ON e.exam_id = q.exam_id
    WHERE 
      e.status = $1 AND 
      e.exam_for = $2
  `;

  const params = [status, role === "President" || role === "Teacher" ? "Teacher" : "Student"];

  // Add branch filter for department role (not TPO)
  if (role !== "TPO" && branch) {
    query += ` AND e.target_branches @> $3::branch_enum[] `;
    params.push([branch]);
  }

  query += `
    GROUP BY 
      e.exam_id, e.exam_name 
    ORDER BY created_at DESC
  `;

  const paginatedQuery = paginate(query, page, limit);
  const result = await pool.query(paginatedQuery, params);
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

const getLastExam = async (exam_for) => {
  const query = `SELECT * FROM exams WHERE exam_for=$1 AND status='past' ORDER BY created_at DESC LIMIT 1`;
  const result = await pool.query(query, [exam_for]);
  return result.rows[0];
};

// Get Exam Status by ID
const getExamStatusById = async (exam_id) => {
  try {
    // Fetch exam start and end time
    const result = await pool.query(
      "SELECT exam_id, start_time, end_time, status FROM exams WHERE exam_id = $1",
      [exam_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Exam not found" });
    }

    return result.rows[0];

  } catch (error) {
    console.error("Database Error in getExamStatusById:", error);
    throw error;
  }
};

const getExamsByTeacherId = async (teacher_id) => {
  // Query text for databse
  const query_text = `
    SELECT 
      e.exam_id,
      e.exam_name,
      e.duration,
      COUNT(DISTINCT r.question_id) AS total_attempted_questions
    FROM exams e
    JOIN responses r 
    ON e.exam_id = r.exam_id
    WHERE r.student_id = $1
    GROUP BY e.exam_id, e.exam_name, e.duration
    ORDER BY e.exam_name DESC;
  `;
  console.log(teacher_id);
  const result = await pool.query(query_text, [teacher_id]);
  return result.rows;
}

module.exports = {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  getAllPaginatedExams,
  getPaginatedExams,
  getExamsForUser,
  getAllScheduledExams,
  scheduleExam,
  markLiveExam,
  markPastExam,
  getLastExam,
  getExamsByStatus,
  ExamCount,
  getExamStatusById,
  // createExamForTeachersModel,
  getExamsForTeachers,
  getExamsByTeacherId
};  
