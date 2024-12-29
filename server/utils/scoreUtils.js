const { query } = require("../config/db");
require('dotenv').config();
async function calculateAndStoreTotalScore() {


    try {
        // Calculate total score directly in the database using GROUP BY


        const queryText = `SELECT 
    r.student_id,
    r.exam_id,
    COALESCE(COUNT(CASE WHEN r.selected_option = q.correct_option THEN 1 END), 0) AS correct_responses,
    COALESCE(COUNT(q.question_id), 0) AS max_score
FROM 
    responses AS r
LEFT JOIN 
    questions AS q 
ON 
    r.question_id = q.question_id
GROUP BY 
    r.student_id, r.exam_id;
`
        const totalScoreResult = await query(queryText);

        const result = totalScoreResult.rows;

        return result;
    } catch (err) {
        console.error('Error calculating and storing total score:', err);
        throw err;
    }
}
module.exports = { calculateAndStoreTotalScore };