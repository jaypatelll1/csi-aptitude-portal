const pool = require("../config/db");

// 1. Department Average Score (Per Exam)
const getDepartmentAvgScore = async (department) => {
  const result = await pool.query(`
    SELECT exam_id, exam_name, department_name AS department, 
           AVG(total_score) AS average_score
    FROM student_analysis
    WHERE department_name = $1
    GROUP BY exam_id, exam_name, department_name;
  `, [department]);

  return result.rows;
};


const getCategoryPerformance = async (department) => {
  const result = await pool.query(`
    SELECT 
        exam_id, 
        exam_name, 
        department_name AS department,
        jsonb_each.key AS category,
        AVG((jsonb_each.value->>'score')::FLOAT) AS average_category_score
    FROM student_analysis, 
    LATERAL jsonb_each(category::jsonb)  
    WHERE department_name = $1
    GROUP BY exam_id, exam_name, department_name, jsonb_each.key;
  `, [department]);

  return result.rows;
};




// 3. Top Performer (Overall Best in Department)
const getTopPerformer = async (department) => {
  const result = await pool.query(`
    SELECT student_id, student_name, department_name AS department, 
           AVG(total_score) AS overall_average_score
    FROM student_analysis
    WHERE department_name = $1
    GROUP BY student_id, student_name, department_name
    ORDER BY overall_average_score DESC
    LIMIT 1;
  `, [department]);

  return result.rows[0]; // Return only one student
};

// 4. Bottom Performer (Overall Weakest in Department)
const getBottomPerformer = async (department) => {
  const result = await pool.query(`
    SELECT student_id, student_name, department_name AS department, 
           AVG(total_score) AS overall_average_score
    FROM student_analysis
    WHERE department_name = $1
    GROUP BY student_id, student_name, department_name
    ORDER BY overall_average_score ASC
    LIMIT 1;
  `, [department]);

  return result.rows[0]; // Return only one student
};


// 5. Participation Rate
const getParticipationRate = async (department) => {
  const result = await pool.query(`
    SELECT 
        sa.department_name,
        sa.exam_id,
        (COUNT(DISTINCT sa.student_id) * 100.0) / 
        NULLIF((SELECT COUNT(DISTINCT u.user_id) 
                FROM users u 
                WHERE u.department = sa.department_name 
                  AND u.role = 'Student'), 0) 
        AS participation_rate
    FROM student_analysis sa
    WHERE sa.attempted = TRUE
      AND sa.department_name = $1  -- ✅ Filter by department
    GROUP BY sa.department_name, sa.exam_id;
  `, [department]);

  return result.rows;
};







// 6. Accuracy Rate
const getAccuracyRate = async (department) => {
  const result = await pool.query(`
    SELECT department_name AS department, 
      CASE 
        WHEN SUM(max_score) = 0 THEN 0 
        ELSE (SUM(total_score) * 100.0) / SUM(max_score) 
      END AS accuracy_rate
    FROM student_analysis
    WHERE department_name = $1
    GROUP BY department_name;
  `, [department]);
  return result.rows;
};

// // 7. Time Spent Analysis
// const getTimeSpentAnalysis = async (department) => {
//   const result = await pool.query(`
//     SELECT 
//         department_name AS department, 
//         AVG(EXTRACT(EPOCH FROM (end_time - created_at))) AS avg_time_spent_seconds
//     FROM student_analysis
//     WHERE department_name = $1 AND end_time IS NOT NULL
//     GROUP BY department_name;
//   `, [department]);

//   return result.rows;
// };

// 8. Weak Areas
const getWeakAreas = async (department) => {
  const result = await pool.query(`
    SELECT 
        department_name AS department, 
        jsonb_each.key AS category, 
        COUNT(*) AS incorrect_count
    FROM student_analysis, 
    LATERAL jsonb_each(category::jsonb)  
    WHERE department_name = $1 
    AND (jsonb_each.value->>'score')::FLOAT < ((jsonb_each.value->>'max_score')::FLOAT * 0.5)  
    GROUP BY department_name, jsonb_each.key
    ORDER BY incorrect_count DESC
    LIMIT 5;
  `, [department]);

  return result.rows;
};


module.exports = {
  getDepartmentAvgScore,
  getCategoryPerformance,
  getTopPerformer,
  getBottomPerformer,
  getParticipationRate,
  getAccuracyRate,
  // getTimeSpentAnalysis,
  getWeakAreas,
};
