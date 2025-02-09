const { query } = require("../config/db");
require("dotenv").config();

async function calculateAndStoreTotalScore(examId) {
  try {
    // Step 1: Calculate the max score for the exam
    const maxScoreQuery = `
      SELECT 
        COUNT(question_id) AS max_score
      FROM 
        questions
      WHERE 
        exam_id = $1;
    `;
    const maxScoreResult = await query(maxScoreQuery, [examId]);
    const max_score = maxScoreResult.rows[0]?.max_score || 0;
    // console.log('max score is ', max_score);
    

    if (max_score === 0) {
      console.error(`No questions found for exam_id ${examId}`);
      return;
    }

    // console.log(`Max score for exam ${examId}: ${max_score}`);

    // Step 2: Calculate correct responses for each student
    const correctResponsesQuery = `
      SELECT 
        r.student_id,
        r.exam_id,
        COUNT(CASE WHEN r.selected_option = q.correct_option THEN 1 END) AS correct_responses
      FROM 
        responses AS r
      LEFT JOIN 
        questions AS q 
      ON 
        r.question_id = q.question_id
      WHERE 
        r.exam_id = $1
      GROUP BY 
        r.student_id, r.exam_id;
    `;
    const correctResponsesResult = await query(correctResponsesQuery, [examId]);

    // console.log("Correct Responses:", correctResponsesResult.rows);

    // Step 3: Insert or update scores into the results table
    const upsertQuery = `
      INSERT INTO results (student_id, exam_id, total_score, max_score, completed_at)
      VALUES ($1, $2, $3, $4, $5)
     
    `;

    for (const row of correctResponsesResult.rows) {
      const { student_id, exam_id, correct_responses } = row;
      const total_score = correct_responses || 0;
      const completed_at = new Date().toISOString();

      await query(upsertQuery, [student_id, exam_id, total_score, max_score, completed_at]);
    //   console.log(`Score for student ${student_id} in exam ${exam_id} has been stored/updated.`);
    }
  } catch (err) {
    console.error("Error calculating and storing total score:", {
      examId,
      error: err.stack,
    });
  }
}

module.exports = { calculateAndStoreTotalScore };