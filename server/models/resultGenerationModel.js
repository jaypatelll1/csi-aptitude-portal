const { dbWrite } = require("../config/db");

async function calculateScoresByExamId(examId) {
  const query = `
    SELECT jsonb_object_agg(
      student_id,
      jsonb_build_object(
        'correct_single_choice_responses', correct_single_choice_responses,
        'partial_multiple_choice_marks', partial_multiple_choice_marks,
        'total_marks', total_marks
      )
    ) AS results
    FROM (
      SELECT 
        r.student_id,

        COUNT(*) FILTER (
          WHERE q.question_type = 'single_choice'
          AND r.selected_option = q.correct_option
        ) AS correct_single_choice_responses,

        SUM(
          CASE
            WHEN q.question_type = 'multiple_choice' THEN
              CASE
                WHEN NOT (r.selected_options::jsonb <@ q.correct_options)
                  THEN 0
                ELSE
                  (jsonb_array_length(r.selected_options::jsonb) * 1.0 /
                   jsonb_array_length(q.correct_options))
              END
            ELSE 0
          END
        ) AS partial_multiple_choice_marks,

        COUNT(*) FILTER (
          WHERE q.question_type = 'single_choice'
          AND r.selected_option = q.correct_option
        )
        +
        SUM(
          CASE
            WHEN q.question_type = 'multiple_choice' THEN
              CASE
                WHEN NOT (r.selected_options::jsonb <@ q.correct_options)
                  THEN 0
                ELSE
                  (jsonb_array_length(r.selected_options::jsonb) * 1.0 /
                   jsonb_array_length(q.correct_options))
              END
            ELSE 0
          END
        ) AS total_marks

      FROM responses r
      LEFT JOIN questions q
        ON r.question_id = q.question_id
      WHERE r.exam_id = ?
      GROUP BY r.student_id
    ) AS student_results;
  `;

  try {
    const { rows } = await dbWrite.raw(query, [examId]);

    return rows[0]?.results || {};
  } catch (err) {
    console.error("Error calculating the score:", err);
    throw err;
  }
}

const generateResultsByExamId = async (examId) => {
  try {
    const scores = await calculateScoresByExamId(examId);
    return scores;
  } catch (err) {
    console.error("Error generating results:", err);
  }
};

module.exports = {
  calculateScoresByExamId,
  generateResultsByExamId,
};
