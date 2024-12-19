const {query }= require("../config/db");

async function calculateAndStoreTotalScore(userId) {
    
  
    try {
      // Calculate total score directly in the database using GROUP BY
      const totalScoreResult = await query(
        `
SELECT 
    r.student_id,
    r.exam_id,
    COUNT(*) AS correct_responses
FROM 
    responses AS r
JOIN 
    questions AS q 
ON 
    r.question_id = q.question_id
WHERE 
    r.selected_option = q.correct_option
GROUP BY 
    r.student_id, r.exam_id;

        `,
      );
  
      
  
      return totalScore;
    } catch (err) {
      console.error('Error calculating and storing total score:', err);
      throw err;
    } 
    }
  