const { query } = require('../config/db');
const { paginate } = require('../utils/pagination');

// CREATE: Insert a new teacher result
async function createResultForTeachers(
  teacher_id,
  exam_id,
  question_id,
  marks_allotted,
  max_score,
  comments
) {
  try {
    const completed_at = new Date().toISOString();
    const queryText = `INSERT INTO teacher_results (teacher_id, exam_id, question_id, marks_allotted, max_score, comments, completed_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`;
    const values = [
      teacher_id,
      exam_id,
      question_id,
      marks_allotted,
      max_score,
      comments,
      completed_at,
    ];
    const res = await query(queryText, values);
    return res.rows[0];
  } catch (err) {
    console.error('Error inserting teacher result:', err);
  }
}

// READ: Fetch all results for teachers
async function getAllTeacherResults() {
  try {
    const queryText = 'SELECT * FROM teacher_results;';
    const res = await query(queryText);
    return res.rows;
  } catch (err) {
    console.error('Error fetching teacher results:', err);
  }
}

// READ: Fetch results by teacher ID
async function getResultsByTeacher(teacher_id) {
  try {
    const queryText = 'SELECT * FROM teacher_results WHERE teacher_id=$1;';
    const res = await query(queryText, [teacher_id]);
    return res.rows;
  } catch (err) {
    console.error('Error fetching results by teacher:', err);
  }
}

// READ: Fetch a single result by exam and question ID
async function getTeacherResultById(exam_id, question_id) {
  try {
    const queryText =
      'SELECT * FROM teacher_results WHERE exam_id=$1 AND question_id=$2;';
    const res = await query(queryText, [exam_id, question_id]);
    return res.rows.length === 0 ? 'No Result Found' : res.rows[0];
  } catch (err) {
    console.error('Error fetching teacher result:', err);
  }
}

// UPDATE: Update a teacher's result
async function updateTeacherResult(
  exam_id,
  question_id,
  teacher_id,
  marks_allotted,
  max_score,
  comments
) {
  try {
    const queryText = `UPDATE teacher_results SET marks_allotted = $1, max_score = $2, comments = $3
                        WHERE teacher_id=$4 AND exam_id = $5 AND question_id = $6 RETURNING *;`;
    const values = [
      marks_allotted,
      max_score,
      comments,
      teacher_id,
      exam_id,
      question_id,
    ];
    const res = await query(queryText, values);
    return res.rows[0];
  } catch (err) {
    console.error('Error updating teacher result:', err);
  }
}

// DELETE: Delete a teacher's result
async function deleteTeacherResult(teacher_id, exam_id, question_id) {
  try {
    const queryText =
      'DELETE FROM teacher_results WHERE teacher_id=$1 AND exam_id=$2 AND question_id=$3 RETURNING *;';
    const res = await query(queryText, [teacher_id, exam_id, question_id]);
    return res.rows[0];
  } catch (err) {
    console.error('Error deleting teacher result:', err);
  }
}

// Pagination: Get paginated results for an exam
async function getPaginatedTeacherResultsByExam(exam_id, page, limit) {
  const queryText = `SELECT * FROM teacher_results WHERE exam_id=${exam_id}`;
  const paginatedQuery = paginate(queryText, page, limit);
  const result = await query(paginatedQuery);
  return result.rows;
}

// Get past results for an exam
async function pastTeacherResult(exam_id) {
  try {
    const queryText =
      'SELECT * FROM teacher_results WHERE exam_id=$1 ORDER BY completed_at DESC;';
    const res = await query(queryText, [exam_id]);
    return res.rows;
  } catch (err) {
    console.error('Error fetching past teacher results:', err);
  }
}

// Get detailed correctness of answers
async function getCorrectIncorrectForTeacher(teacher_id, exam_id) {
  try {
    const queryText = `
      SELECT 
            tr.teacher_id,
            q.question_id,
            q.question_text,
            q.options,
            q.category,
            q.question_type,

            -- Store selected response in a consistent JSONB format
            CASE 
                WHEN q.question_type = 'multiple_choice' THEN tr.selected_options
                WHEN q.question_type = 'text' THEN to_jsonb(tr.text_answer)
                ELSE to_jsonb(tr.selected_option)
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
                    THEN (tr.selected_options @> q.correct_options AND q.correct_options @> tr.selected_options)::text
                ELSE (tr.selected_option = q.correct_option)::text
            END AS result_status

      FROM teacher_responses tr
      JOIN questions q 
      ON tr.question_id = q.question_id
      WHERE tr.teacher_id = $1
      AND tr.exam_id = $2;`;
    const res = await query(queryText, [teacher_id, exam_id]);
    return res.rows;
  } catch (err) {
    console.error('Error fetching correct/incorrect teacher results:', err);
  }
}

module.exports = {
  createResultForTeachers,
  getAllTeacherResults,
  getResultsByTeacher,
  getTeacherResultById,
  updateTeacherResult,
  deleteTeacherResult,
  getPaginatedTeacherResultsByExam,
  pastTeacherResult,
  getCorrectIncorrectForTeacher,
};
