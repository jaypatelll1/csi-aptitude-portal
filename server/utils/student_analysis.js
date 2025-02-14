const { query } = require('../config/db');
require('dotenv').config();
const { getResultById } = require('../models/resultModel');
const { getUserById } = require('../models/userModel');
const { getExamById } = require('../models/examModel');
const { getResponsesByStudent } = require('../models/responseModel');
const {
  checkStudentAnalysis,
  insertStudentAnalysis,
} = require('../models/analysisModel');

const category_score = async (exam_id, student_id) => {
  try {
    const sql = `
            SELECT 
                q.category,
                COUNT(*) FILTER (WHERE r.selected_option = q.correct_option) AS score,
                COUNT(*) AS max_score
            FROM responses r
            JOIN questions q ON r.question_id = q.question_id
            WHERE r.exam_id = $1 AND r.student_id = $2
            GROUP BY q.category;
        `;

    const { rows } = await query(sql, [exam_id, student_id]);

    // Convert array of objects into a JSON structure
    const categoryScores = {};
    rows.forEach((row) => {
      categoryScores[row.category] = {
        score: row.score,
        max_score: row.max_score,
      };
    });

    return categoryScores;
  } catch (error) {
    console.error('Error in category_score:', error);
    return {};
  }
};

async function student_analysis(exam_id, student_id) {
  try {
    if (!exam_id || !student_id) {
      throw new Error('Missing exam_id or student_id');
    }
    // Check if analysis already exists
    const exists = await checkStudentAnalysis(exam_id, student_id);
    if (exists) {
      console.log(
        `Analysis for student ${student_id} in exam ${exam_id} already exists. Skipping.`
      );
      return;
    }

    // Fetch student and exam details
    const student = await getUserById(student_id);

    if (!student) {
      throw new Error(`Student with ID ${student_id} not found.`);
    }

    const exam = await getExamById(exam_id);

    if (!exam) {
      throw new Error(`Student with ID ${student_id} not found.`);
    }

    const result = await getResultById(exam_id, student_id);

    let attempted = false;
    let categoryScores = null;
    let total_score = 0;
    let max_score = result?.max_score || 0;

    // Calculate category-wise scores
    if (result.length > 0) {
      attempted = result.total_score > 0;
      total_score = result.total_score || 0;
      categoryScores = await category_score(exam_id, student_id);
    }

    // Prepare data for insertion
    const analysisData = {
      exam_id,
      department_name: student.department,
      student_id,
      student_name: student.name,
      exam_name: exam.exam_name,
      category: categoryScores ? JSON.stringify(categoryScores) : null, // Null if no responses
      total_score,
      max_score,
      attempted,
    };

    console.log('analysisData:', analysisData);

    await insertStudentAnalysis(analysisData);
    console.log('data inserted ', analysisData);
  } catch (error) {
    console.error('Error in student_analysis:', error);
  }
}
// student_analysis(14,103)
module.exports = { student_analysis };
