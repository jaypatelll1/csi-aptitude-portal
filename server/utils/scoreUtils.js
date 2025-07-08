const { query } = require("../config/db");
require("dotenv").config();


async function calculateScoreForMCQs(examId, studentId) {
  try {
    // Step 1: Get max scor
    const maxScoreQuery = `
      SELECT COUNT(question_id) AS max_score
      FROM questions
      WHERE exam_id = $1 AND question_type != 'text';
    `;
    const maxScoreResult = await query(maxScoreQuery, [examId]);
    const max_score = parseInt(maxScoreResult.rows[0]?.max_score || 0);

    if (max_score === 0) {
      console.error(`No MCQ questions found for exam_id ${examId}`);
      return;
    }

    // Step 2: Get total score
    const totalScoreQuery = `
      SELECT 
        COUNT(q.question_id) AS correct_responses
      FROM 
        questions AS q
      JOIN (
        SELECT 
          r.question_id,
          CASE 
            WHEN q.question_type = 'multiple_choice' THEN 
              ARRAY_AGG(value ORDER BY value)
            WHEN q.question_type = 'single_choice' THEN 
              ARRAY[r.selected_option]
          END AS selected_options
        FROM responses AS r
        JOIN questions AS q ON q.question_id = r.question_id
        LEFT JOIN LATERAL jsonb_array_elements_text(r.selected_options) AS value ON q.question_type = 'multiple_choice'
        WHERE r.exam_id = $1 AND r.student_id = $2
        GROUP BY r.question_id, q.question_type, r.selected_option
      ) AS user_selections
      ON q.question_id = user_selections.question_id
      WHERE 
        CASE 
          WHEN q.question_type = 'multiple_choice' THEN 
            (
              (
                SELECT ARRAY_AGG(value ORDER BY value)
                FROM jsonb_array_elements_text(q.correct_options) AS value
              ) = user_selections.selected_options
            )
          WHEN q.question_type = 'single_choice' THEN 
            (q.correct_option = user_selections.selected_options[1])
          ELSE FALSE
        END;
    `;
    const totalScoreResult = await query(totalScoreQuery, [examId, studentId]);
    const total_score = parseInt(totalScoreResult.rows[0]?.correct_responses || 0);

    // Step 3: Get category-wise score
    const categoryScoreQuery = `
      SELECT 
        q.category,
        COUNT(*) FILTER (
          WHERE (
            (q.question_type = 'single_choice' AND r.selected_option = q.correct_option)
            OR
            (
              q.question_type = 'multiple_choice'
              AND (
                SELECT ARRAY_AGG(val ORDER BY val)
                FROM jsonb_array_elements_text(r.selected_options) val
              ) = (
                SELECT ARRAY_AGG(val ORDER BY val)
                FROM jsonb_array_elements_text(q.correct_options) val
              )
            )
          )
        ) AS score,
        COUNT(*) AS max_score
      FROM responses r
      JOIN questions q ON r.question_id = q.question_id
      WHERE r.exam_id = $1 AND r.student_id = $2
      GROUP BY q.category;
    `;
    const categoryScoreResult = await query(categoryScoreQuery, [examId, studentId]);
    const category_score = {};

    for (const row of categoryScoreResult.rows) {
      category_score[row.category] = {
        score: parseInt(row.score),
        max_score: parseInt(row.max_score),
      };
    }

    // Step 4: Final UPSERT
    const completed_at = new Date().toISOString();
    const upsertQuery = `
  INSERT INTO results (
    student_id,
    exam_id,
    total_score,
    max_score,
    completed_at,
    category_score
  ) VALUES ($1, $2, $3, $4, $5, $6);
`;


    await query(upsertQuery, [
      studentId,
      examId,
      total_score,
      max_score,
      completed_at,
      JSON.stringify(category_score),
    ]);

    console.log(`✅ Result stored for student ${studentId} in exam ${examId}`);
    return {
      student_id: studentId,
      exam_id: examId,
      total_score,
      max_score,
      completed_at,
      category_score,
    };
  } catch (err) {
    console.error("❌ Error in calculateScoreForMCQs:", {
      examId,
      studentId,
      error: err.stack,
    });
    throw err;
  }
}

module.exports = { calculateScoreForMCQs };
