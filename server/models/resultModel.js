const { query } = require('../config/db');
const { paginate } = require('../utils/pagination');
const { calculateAndStoreTotalScore } = require('../utils/scoreUtils');

// CREATE: Insert a new result
async function createResult() {
  try {
    // Get the calculated results
    const results = await calculateAndStoreTotalScore();

    for (const resultRow of results) {
      const { student_id, exam_id, correct_responses, max_score } = resultRow;
      const completed_at = new Date().toISOString();

      const values = [
        student_id,
        exam_id,
        correct_responses,
        max_score,
        completed_at,
      ];

      const queryText = `
        INSERT INTO results (student_id, exam_id, total_score, max_score, completed_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;

      try {
        // Insert into the database
        let res = await query(queryText, values);
        // Log each inserted row
      } catch (err) {
        // Log errors for specific rows and continue
        console.error('Error inserting row:', err);
      }
    }

    console.log('All rows processed.');
  } catch (err) {
    console.error('Error creating result:', err);
  }
  return 1;
}

// READ: Fetch all results
async function getAllResults(student_id) {
  const queryText = 'SELECT * FROM results WHERE student_id=$1;';

  try {
    const res = await query(queryText, [student_id]);
    return res.rows;
  } catch (err) {
    console.error('Error fetching results:', err);
  }
}

// READ: Fetch a single result by ID
const getResultById= async (exam_id, student_id)=> {
  const queryText =
    'SELECT * FROM results WHERE exam_id = $1 AND student_id=$2;';
  const values = [exam_id, student_id];

  try {
    const res = await query(queryText, values);
    if (res.rows.length === 0) {
      return 'No Result Found';
    }
    return res.rows[0];
  } catch (err) {
    console.error('Error fetching result:', err);
  }
}
// getResultById(274,3)

// UPDATE: Update a result
async function updateResult(result) {
  const { total_score, max_score, completed_at, exam_id, student_id } = result;
  const queryText = `
    UPDATE results
    SET total_score = $1, max_score = $2, completed_at = $3
    WHERE exam_id = $4 AND student_id=$5
    RETURNING *;
  `;
  const values = [total_score, max_score, completed_at, exam_id, student_id];

  try {
    const res = await query(queryText, values);
    console.log('Updated result:', res.rows[0]);
    return res.rows[0];
  } catch (err) {
    console.error('Error updating result:', err);
  }
}

// DELETE: Delete a result
async function deleteResult(exam_id) {
  const queryText = 'DELETE FROM results WHERE exam_id = $1 RETURNING *;';
  const values = [exam_id];

  try {
    const res = await query(queryText, values);
    console.log('Deleted result:', res.rows[0]);
    return res.rows[0];
  } catch (err) {
    console.error('Error deleting result:', err);
  }
}

// Pagination
// Get all results for a specific exam with pagination
const getPaginatedResultsByExam = async (exam_id, page, limit) => {
    const queryText = `SELECT * FROM results WHERE exam_id=${exam_id}`;
    const paginatedqueryText = paginate(queryText, page, limit);
  const result = await query(paginatedqueryText);
  return result.rows;
  // console.log('rresult is ',result.rows);
};

const getResultsByUsers = async (user_id, department, year) => {
  const queryText = `
    SELECT 
        e.exam_name,
        e.exam_id,
        e.duration,
        e.end_time,
        r.total_score,
        r.max_score,
        r.student_id,
        e.status,
        r.result_id,
        q_counts.total_questions,
        (r.exam_id IS NOT NULL) AS "isAttempted"
    FROM exams e
    LEFT JOIN results r 
      ON r.exam_id = e.exam_id AND r.student_id = $1
    LEFT JOIN (
        SELECT exam_id, COUNT(*) AS total_questions
        FROM questions
        GROUP BY exam_id
    ) q_counts
      ON q_counts.exam_id = e.exam_id
    WHERE 
      e.status = 'past'
      AND $2 = ANY(e.target_branches)
      AND $3 = ANY(e.target_years)
    ORDER BY e.end_time DESC;
  `;

  const result = await query(queryText, [user_id, department, year]);

  const formatToReadableDate = (isoString) => {
    const date = new Date(isoString);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
  };

  const resultsWithStatus = result.rows.map((row) => {
    const percentage = (row.total_score / row.max_score) * 100;
    const status = percentage >= 35 ? 'Passed' : 'Failed';

    return {
      exam_name: row.exam_name,
      total_score: row.total_score,
      max_score: row.max_score,
      duration: row.duration,
      Date: formatToReadableDate(row.end_time),
      percentage: Number(percentage.toFixed(2)),
      status: status,
      isAttempted: row.isAttempted,
      exam_id: row.exam_id,
      total_questions: parseInt(row.total_questions, 10)
    };
  });

  return resultsWithStatus;
};




// question_ext, options, question_id
async function getCorrectIncorrect(student_id, exam_id) {
  const queryText = `
    SELECT 
      r.student_id,
      q.question_id,
      q.question_text,
      q.options,
      q.category,
      q.question_type,

      -- Store selected response in a consistent JSONB format
      CASE 
          WHEN q.question_type = 'multiple_choice' THEN r.selected_options
          WHEN q.question_type = 'text' THEN to_jsonb(r.text_answer)
          ELSE to_jsonb(r.selected_option)
      END AS selected_response,

      -- Correct answer should be NULL for text questions
      CASE 
          WHEN q.question_type = 'text' THEN NULL
          WHEN q.question_type = 'multiple_choice' THEN q.correct_options
          ELSE to_jsonb(q.correct_option)
      END AS correct_answer,

      -- Result status: NULL for text questions, 'true' or 'false' otherwise
      CASE 
          WHEN q.question_type = 'text' THEN NULL
          WHEN q.question_type = 'multiple_choice' 
               THEN (r.selected_options @> q.correct_options AND q.correct_options @> r.selected_options)::text
          ELSE (r.selected_option = q.correct_option)::text
      END AS result_status

FROM responses r
JOIN questions q 
ON r.question_id = q.question_id
WHERE r.student_id = $1 
AND r.exam_id = $2;
  `;

  try {
    console.log(`Exam id: ${exam_id} Student id: ${student_id}`);
    const res = await query(queryText, [student_id, exam_id]);
    return res.rows;
  } catch (err) {
    console.error('Error fetching results:', err);
  }
}



module.exports = {
  createResult,
  getAllResults,
  getResultById,
  updateResult,
  deleteResult,
  getPaginatedResultsByExam,
  getResultsByUsers,
  getCorrectIncorrect,
};


