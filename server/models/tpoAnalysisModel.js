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
        SELECT * FROM student_rank ORDER BY overall_rank ASC LIMIT 5;
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
        SELECT * FROM (
        SELECT * FROM student_rank 
        ORDER BY overall_rank DESC 
        LIMIT 5
    ) AS subquery
    ORDER BY overall_rank ASC;
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

const totalParticipationRate = async () => {
  try {
    const result = await query(`
        SELECT 
            COUNT(DISTINCT student_id) AS students_attempted,
            (SELECT COUNT(*) FROM users u) AS total_students,
            ROUND((COUNT(DISTINCT student_id) * 100.0) / 
                  (SELECT COUNT(*) FROM users u), 2) AS participation_rate
        FROM student_analysis sa
        WHERE attempted = TRUE
        ORDER BY participation_rate DESC;
    `);
    return result.rows[0];
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

const deptRanks = async () => {
  try {
    const result = await query(`
        WITH department_averages AS (
            SELECT 
                sa.department_name AS department,
                ROUND(AVG(sa.total_score)::NUMERIC, 2) AS average_score,
                COUNT(DISTINCT sa.exam_id) AS exams_count,
                COUNT(DISTINCT sa.student_id) AS students_count
            FROM student_analysis sa
            GROUP BY sa.department_name
        )
        SELECT 
            department,
            average_score,
            exams_count,
            students_count,
            RANK() OVER (ORDER BY average_score DESC) AS department_rank
        FROM department_averages
        ORDER BY department_rank;
    `);
    return result.rows;
  } catch (error) {
    console.log(error);
  }
};

const getPerformanceOverTime = async (department) => {
  const result = await query(
    `
    WITH latest_exams AS (
    SELECT 
        sa.exam_id,
        sa.exam_name,
        sa.department_name AS department,
        ROUND(AVG(sa.total_score)::NUMERIC, 0) AS average_score,
        TO_CHAR(e.created_at, 'DD-Mon-YYYY') AS created_on,
        ROW_NUMBER() OVER (ORDER BY e.created_at DESC) AS row_num
    FROM student_analysis sa
    JOIN exams e ON sa.exam_id = e.exam_id
    WHERE sa.department_name = $1
    GROUP BY sa.exam_id, sa.exam_name, sa.department_name, e.created_at
)
SELECT exam_id, exam_name, department, average_score, created_on
FROM latest_exams
WHERE row_num <= 5
ORDER BY created_on ASC;
  `,
    [department]
  );

  if (result.rows.length === 0) {
    return [{}];
  }

  return result.rows;
};


module.exports = {
  getDeptAvgScores,
  topScorers,
  weakScorers,
  accuracyRatePerDept,
  deptParticipationRate,
  categoryWiseAccuracy,
  totalParticipationRate,
  deptRanks,
  getPerformanceOverTime
};
