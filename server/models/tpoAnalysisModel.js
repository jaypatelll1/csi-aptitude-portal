const { query } = require('../config/db');

const getDeptAvgScores = async () => {
  try {
    const result = await query(`
        WITH all_departments AS (
            SELECT unnest(enum_range(NULL::branch_enum)) AS department_name
        )
        SELECT 
            department_name,
            COALESCE((
                SELECT ROUND(AVG(total_score)::NUMERIC, 2) 
                FROM student_analysis 
                WHERE student_analysis.department_name = d.department_name
            ), 0.00) AS avg_score
        FROM all_departments d
        ORDER BY avg_score DESC;
        `);
    return result.rows;
  } catch (error) {
    console.log(error);
  }
};

const topScorers = async () => {
  try {
    const result = await query(`
        SELECT DISTINCT ON (department_name) 
            student_id, student_name, exam_id, exam_name, department_name, total_score, max_score
        FROM student_analysis
        ORDER BY department_name, total_score DESC, exam_id;
    `);
    return result.rows;
  } catch (error) {
    console.log(error);
  }
};

const weakScorers = async () => {
  try {
    // Students scoring less than 40% of total marks
    const result = await query(`
        SELECT DISTINCT ON (department_name) 
            student_id, student_name, exam_id, exam_name, department_name, total_score, max_score
        FROM student_analysis
        ORDER BY department_name, total_score ASC, exam_id;
    `);
    return result.rows;
  } catch (error) {
    console.log(error);
  }
};

const accuracyRatePerDept = async () => {
  try {
    const result = await query(`
        SELECT 
            sa.department_name,
            ROUND((((SUM(sa.total_score) * 100.0) / NULLIF(SUM(sa.max_score), 0))::NUMERIC), 2) AS accuracy_rate
        FROM student_analysis sa
        GROUP BY sa.department_name
        ORDER BY accuracy_rate DESC;
    `);
    return result.rows;
  } catch (error) {
    console.log(error);
  }
};

const deptParticipationRate = async () => {
  try {
    const result = await query(`
        SELECT 
            department_name AS department,
            COUNT(DISTINCT student_id) AS students_attempted,
            (SELECT COUNT(*) FROM users u WHERE u.department = sa.department_name) AS total_students,
            ROUND((COUNT(DISTINCT student_id) * 100.0) / 
                  (SELECT COUNT(*) FROM users u WHERE u.department = sa.department_name), 2) AS participation_rate
        FROM student_analysis sa
        WHERE attempted = TRUE
        GROUP BY department_name
        ORDER BY participation_rate DESC;
    `);
    return result.rows;
  } catch (error) {
    console.log(error);
  }
};

const categoryWiseAccuracy = async () => {
  try {
    const result = await query(`
        SELECT 
            sa.department_name,
            cat.key AS category,
            COUNT(DISTINCT sa.student_id) AS students_attempted,
            ROUND(AVG((cat.value->>'score')::NUMERIC), 2) AS avg_score,
            ROUND(AVG((cat.value->>'max_score')::NUMERIC), 2) AS avg_max_score
        FROM student_analysis sa, 
        LATERAL jsonb_each(sa.category) AS cat  -- Unnest JSONB to extract category names and values
        GROUP BY sa.department_name, cat.key
        ORDER BY sa.department_name, avg_score DESC;
    `);
    return result.rows;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getDeptAvgScores,
  topScorers,
  weakScorers,
  accuracyRatePerDept,
  deptParticipationRate,
  categoryWiseAccuracy
};
