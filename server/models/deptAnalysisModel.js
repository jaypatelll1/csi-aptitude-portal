const { dbWrite } = require("../config/db");

/*
DEPARTMENT AVERAGE SCORE
*/
const getDepartmentAvgScore = async (department) => {

  const result = await dbWrite("student_analysis")
    .select("department_name as department")
    .avg({ average_score: "total_score" })
    .where("department_name", department)
    .groupBy("department_name")
    .first();

  if (!result) return { department, average_score: 0 };

  result.average_score = Number(result.average_score).toFixed(2);

  return result;
};

/*
STUDENT COUNT BY DEPARTMENT
*/
const getStudentCountByDepartment = async (department) => {

  const result = await dbWrite("users")
    .count("* as student_count")
    .where({
      department,
      role: "Student"
    })
    .first();

  return result;
};

/*
AVERAGE SCORE PER EXAM
*/
const getDepartmentAvgScorePerExam = async (department) => {

  return await dbWrite("student_analysis")
    .select(
      "exam_id",
      "exam_name",
      "department_name as department"
    )
    .avg({ average_score: "total_score" })
    .where("department_name", department)
    .groupBy("exam_id", "exam_name", "department_name")
    .orderBy("average_score", "desc");
};

/*
CATEGORY PERFORMANCE
*/
const getCategoryPerformance = async (department) => {

  const result = await dbWrite.raw(
    `
    SELECT 
        department_name AS department,
        jsonb_each.key AS category,
        ROUND(AVG((jsonb_each.value->>'score')::FLOAT)::NUMERIC, 2) AS average_category_score,
        MAX((jsonb_each.value->>'score')::FLOAT)::NUMERIC AS max_category_score
    FROM student_analysis,
    LATERAL jsonb_each(category::jsonb)
    WHERE department_name = ?
    GROUP BY department_name, jsonb_each.key
    `,
    [department]
  );

  if (result.rows.length === 0) {

    return [
      { department, category: "general knowledge", average_category_score: 0 },
      { department, category: "quantitative aptitude", average_category_score: 0 },
      { department, category: "logical reasoning", average_category_score: 0 },
      { department, category: "technical", average_category_score: 0 },
      { department, category: "verbal ability", average_category_score: 0 }
    ];
  }

  return result.rows;
};

/*
TOP PERFORMERS
*/
const getTopPerformer = async (department) => {

  return await dbWrite("student_rank")
    .where("department_name", department)
    .orderBy("department_rank", "asc")
    .limit(5);
};

/*
BOTTOM PERFORMERS
*/
const getBottomPerformer = async (department) => {

  const result = await dbWrite("student_rank")
    .where("department_name", department)
    .orderBy("department_rank", "desc")
    .limit(5);

  return result.reverse();
};

/*
PARTICIPATION RATE
*/
const getParticipationRate = async (department) => {

  const result = await dbWrite.raw(
    `
    SELECT 
        department_name AS department,
        COUNT(DISTINCT student_id) AS students_attempted,
        (SELECT COUNT(*) FROM users u WHERE u.department = sa.department_name AND u.role='Student') AS total_students,
        ROUND((COUNT(DISTINCT student_id) * 100.0) /
              (SELECT COUNT(*) FROM users u WHERE u.department = sa.department_name AND u.role='Student'), 2)
        AS participation_rate
    FROM student_analysis sa
    WHERE attempted = TRUE
    AND department_name = ?
    GROUP BY department_name
    `,
    [department]
  );

  if (result.rows.length === 0) {
    return {
      department,
      students_attempted: 0,
      total_students: 0,
      participation_rate: 0
    };
  }

  return result.rows[0];
};

/*
PARTICIPATION RATE PER EXAM
*/
const getParticipationRatePerExam = async (department) => {

  const result = await dbWrite.raw(
    `
    SELECT 
        sa.department_name,
        sa.exam_id,
        (COUNT(DISTINCT sa.student_id) * 100.0) /
        NULLIF(
            (SELECT COUNT(DISTINCT u.user_id)
             FROM users u
             WHERE u.department = sa.department_name
             AND u.role = 'Student'),0
        ) AS participation_rate
    FROM student_analysis sa
    WHERE sa.attempted = TRUE
    AND sa.department_name = ?
    GROUP BY sa.department_name, sa.exam_id
    `,
    [department]
  );

  return result.rows;
};

/*
ACCURACY RATE
*/
const getAccuracyRate = async (department) => {

  const result = await dbWrite("student_analysis as sa")
    .select("sa.department_name")
    .sum("sa.total_score as total")
    .sum("sa.max_score as max")
    .where("sa.department_name", department)
    .groupBy("sa.department_name")
    .first();

  if (!result) return { department, accuracy_rate: 0 };

  const accuracy = (result.total * 100) / result.max;

  return {
    department,
    accuracy_rate: Number(accuracy.toFixed(2))
  };
};

/*
WEAK AREAS
*/
const getWeakAreas = async (department) => {

  const result = await dbWrite.raw(
    `
    SELECT 
        department_name AS department, 
        jsonb_each.key AS category, 
        COUNT(*) AS incorrect_count
    FROM student_analysis, 
    LATERAL jsonb_each(category::jsonb)
    WHERE department_name = ?
    AND (jsonb_each.value->>'score')::FLOAT <
        ((jsonb_each.value->>'max_score')::FLOAT * 0.5)
    GROUP BY department_name, jsonb_each.key
    ORDER BY incorrect_count DESC
    LIMIT 5
    `,
    [department]
  );

  return result.rows;
};

/*
PERFORMANCE OVER TIME
*/
const getPerformanceOverTime = async (department) => {

  const result = await dbWrite.raw(
    `
    WITH latest_exams AS (
        SELECT 
            sa.exam_id,
            sa.exam_name,
            sa.department_name AS department,
            ROUND(AVG(sa.total_score)::NUMERIC,0) AS average_score,
            TO_CHAR(e.created_at,'Mon YYYY') AS created_on,
            ROW_NUMBER() OVER (ORDER BY e.created_at DESC) AS row_num
        FROM student_analysis sa
        JOIN exams e ON sa.exam_id = e.exam_id
        WHERE sa.department_name = ?
        GROUP BY sa.exam_id, sa.exam_name, sa.department_name, e.created_at
    )
    SELECT exam_id, exam_name, department, average_score, created_on
    FROM latest_exams
    WHERE row_num <= 5
    ORDER BY created_on ASC
    `,
    [department]
  );

  if (result.rows.length === 0) return [];

  return result.rows;
};

/*
DEPARTMENT RANK
*/
const deptRanks = async (department) => {

  const result = await dbWrite.raw(
    `
    WITH department_averages AS (
        SELECT 
            sa.department_name AS department,
            ROUND(AVG(sa.total_score)::NUMERIC,2) AS average_score,
            COUNT(DISTINCT sa.exam_id) AS exams_count,
            COUNT(DISTINCT sa.student_id) AS students_count
        FROM student_analysis sa
        GROUP BY sa.department_name
    )
    SELECT *
    FROM (
        SELECT *,
        RANK() OVER (ORDER BY average_score DESC) AS department_rank
        FROM department_averages
    ) ranked
    WHERE department = ?
    `,
    [department]
  );

  return result.rows[0];
};

module.exports = {
  getDepartmentAvgScore,
  getDepartmentAvgScorePerExam,
  getCategoryPerformance,
  getTopPerformer,
  getBottomPerformer,
  getParticipationRate,
  getParticipationRatePerExam,
  getAccuracyRate,
  getWeakAreas,
  getPerformanceOverTime,
  deptRanks,
  getStudentCountByDepartment
};
