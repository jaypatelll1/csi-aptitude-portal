const {query} = require("../config/db");

async function calculateScoresByExamId (examId){
    const queryText = `
        SELECT jsonb_object_agg(
            student_id, jsonb_build_object(
                'correct_single_choice_responses', correct_single_choice_responses,
                'partial_multiple_choice_marks', partial_multiple_choice_marks,
                'total_marks', total_marks
            )
        ) AS results
        FROM (
        SELECT 
            r.student_id,
        
            -- Count correct single-choice answers (1 mark each)
            COUNT(*) FILTER (
                WHERE q.question_type = 'single_choice' 
                AND r.selected_option = q.correct_option
            ) AS correct_single_choice_responses,

            -- Sum partial marks for multiple-choice questions (1 mark max per MCQ)
            SUM(
                CASE 
                    WHEN q.question_type = 'multiple_choice' THEN 
                        CASE 
                            WHEN NOT (r.selected_options::jsonb <@ q.correct_options)  
                                 THEN 0  -- Incorrect option selected → 0 marks
                            ELSE 
                                (jsonb_array_length(r.selected_options::jsonb) * 1.0 / jsonb_array_length(q.correct_options))
                        END 
                    ELSE 0
                END
            ) AS partial_multiple_choice_marks,

            -- Total marks: single-choice + multiple-choice
            COUNT(*) FILTER (
                WHERE q.question_type = 'single_choice' 
                AND r.selected_option = q.correct_option
            ) + 
            SUM(
                CASE 
                    WHEN q.question_type = 'multiple_choice' THEN 
                        CASE 
                            WHEN NOT (r.selected_options::jsonb <@ q.correct_options)  
                                 THEN 0
                            ELSE 
                                (jsonb_array_length(r.selected_options::jsonb) * 1.0 / jsonb_array_length(q.correct_options)) 
                        END 
                    ELSE 0
                END
            ) AS total_marks

            FROM responses AS r
            LEFT JOIN questions AS q 
            ON r.question_id = q.question_id
            WHERE r.exam_id = $1
            GROUP BY r.student_id  -- Group by student ID to compute per-student results
        ) AS student_results;
    `
    // Object for values for exam_id 
    const values = [examId];

    // Execution of the query 
    try{
        let result = await query(queryText, values);
        console.log(result.rows[0]);
        return result;
    } catch(err){
        console.log("Error calculating the score: ",err);
    }
}

const generateResultsByExamId = async (examId) => {
    const totalScoreObject = calculateScoresByExamId(examId);
    
}

calculateScoresByExamId(137);

module.exports = {calculateScoresByExamId};
