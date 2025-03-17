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
        exam_id = $1 AND question_type != 'text';
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


/*async function calculateScore(examId, studentId) {
  try {
    // Step 1: Calculate the max score for the exam
    const maxScoreQuery = `
      SELECT COUNT(question_id) AS max_score
      FROM questions
      WHERE exam_id = $1;
    `;
    const maxScoreResult = await query(maxScoreQuery, [examId]);
    const max_score = maxScoreResult.rows[0]?.max_score || 0;

    if (max_score === 0) {
      console.error(`No questions found for exam_id ${examId}`);
      return;
    }

    // Step 2: Calculate correct responses for the given student
    const correctResponsesQuery = `
      SELECT 
        COUNT(CASE WHEN r.selected_option = q.correct_option THEN 1 END) AS correct_responses
      FROM 
        responses AS r
      LEFT JOIN 
        questions AS q 
      ON 
        r.question_id = q.question_id
      WHERE 
        r.exam_id = $1 AND r.student_id = $2;
    `;
    const correctResponsesResult = await query(correctResponsesQuery, [examId, studentId]);
    const total_score = correctResponsesResult.rows[0]?.correct_responses || 0;
    const completed_at = new Date().toISOString();

    // Step 3: Insert or update score using ON CONFLICT
    const insertQuery = `
      INSERT INTO results (student_id, exam_id, total_score, max_score, completed_at)
      VALUES ($1, $2, $3, $4, $5)
    `;

    const result = await query(insertQuery, [studentId, examId, total_score, max_score, completed_at]);

    console.log(`Score for student ${studentId} in exam ${examId} has been inserted/updated.`);





  } catch (err) {
    console.error("Error calculating and storing total score:", {
      examId,
      studentId,
      error: err.stack,
    });
  }
}*/

//use the below function for calculating total score for an exam including multiple choice and single choice both types of questions

async function calculateScoreForMCQs(examId, studentId) {
  try {
    const maxScoreQuery = `
      SELECT COUNT(question_id) AS max_score
      FROM questions
      WHERE exam_id = $1;
    `;
    const maxScoreResult = await query(maxScoreQuery, [examId]);
    const max_score = maxScoreResult.rows[0]?.max_score || 0;

    if (max_score === 0) {
      console.error(`No questions found for exam_id ${examId}`);
      return;
    }

    const correctResponsesQuery = `
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
  FROM 
    responses AS r
  JOIN 
    questions AS q ON q.question_id = r.question_id
  LEFT JOIN 
    LATERAL jsonb_array_elements_text(r.selected_options) AS value ON q.question_type = 'multiple_choice'
  WHERE 
    r.exam_id = $1 AND r.student_id = $2
  GROUP BY 
    r.question_id, q.question_type, r.selected_option
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
        AND NOT (
          user_selections.selected_options = ARRAY[null]::text[]
          AND (
            SELECT ARRAY_AGG(value ORDER BY value) 
            FROM jsonb_array_elements_text(q.correct_options) AS value
          ) = ARRAY[null]::text[]
        )
        AND ARRAY_LENGTH(user_selections.selected_options, 1) = (
          SELECT COUNT(*)
          FROM jsonb_array_elements_text(q.correct_options)
        )
      )
    WHEN q.question_type = 'single_choice' THEN 
      (q.correct_option = user_selections.selected_options[1])
    ELSE 
      FALSE
  END;

`

    const correctResponsesResult = await query(correctResponsesQuery, [examId, studentId]);
    const total_score = correctResponsesResult.rows[0]?.correct_responses || 0;
    const completed_at = new Date().toISOString();

    const upsertQuery = `
      INSERT INTO results (student_id, exam_id, total_score, max_score, completed_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (student_id, exam_id)
      DO UPDATE SET total_score = $3, max_score = $4, completed_at = $5;
    `;

    await query(upsertQuery, [studentId, examId, total_score, max_score, completed_at]);

    console.log(`Score for student ${studentId} in exam ${examId} has been inserted/updated.`);

    return { total_score, max_score, completed_at };
  } catch (err) {
    console.error("Error calculating and storing total score:", {
      examId,
      studentId,
      error: err.stack,
    });
    throw err;
  }
}





module.exports = { calculateAndStoreTotalScore, calculateScoreForMCQs };