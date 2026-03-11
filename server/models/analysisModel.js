const { dbWrite } = require("../config/db");

/*
FORMAT DATE HELPER
*/
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/*
DEPARTMENT ANALYSIS
*/
const getDepartmentAnalysis = async (department_name, year) => {

  let query = dbWrite("department_analysis")
    .select("*")
    .orderBy("department_rank", "asc");

  if (department_name) {
    query = query.where("department_name", department_name);
  }

  if (year) {
    query = query.where("year", year);
  }

  return await query;
};

/*
RANKING HELPERS
*/
const getRankList = async ({ department, year, order = "asc", limit = 5 }) => {

  let query = dbWrite("rank").select("*");

  if (department) query = query.where("department_name", department);
  if (year) query = query.where("year", year);

  query = query.orderBy("overall_rank", order).limit(limit);

  const result = await query;

  return order === "desc" ? result.reverse() : result;
};

const deptTopScorers = (department) =>
  getRankList({ department, order: "asc" });

const deptWeakScorers = (department) =>
  getRankList({ department, order: "desc" });

const topScorers = (year) =>
  getRankList({ year, order: "asc" });

const weakScorers = (year) =>
  getRankList({ year, order: "desc" });

/*
USER ANALYSIS
*/
const getUserAnalysisById = async (student_id) => {

  return await dbWrite("user_analysis")
    .where({ student_id })
    .first();
};

/*
OVERALL RESULTS OF STUDENT
*/
const getOverallResultsOfAStudent = async (student_id) => {

  const rows = await dbWrite("student_analysis")
    .select("*")
    .where({
      student_id,
      attempted: true
    })
    .orderBy("created_at", "desc");

  return rows.map((row) => {

    const percentage = Math.round((row.total_score / row.max_score) * 100);

    return {
      analysis_id: row.analysis_id,
      department: row.department_name,
      student_name: row.student_name,
      category: row.category,
      exam_name: row.exam_name,
      total_score: row.total_score,
      max_score: row.max_score,
      attempted: row.attempted,
      date: formatDate(row.created_at),
      percentage
    };
  });
};

/*
RESULT OF PARTICULAR EXAM
*/
const getResultOfAParticularExam = async (student_id, exam_id) => {

  const rows = await dbWrite("student_analysis")
    .select("*")
    .where({
      student_id,
      exam_id,
      attempted: true
    });

  return rows.map((row) => {

    const percentage = Number(
      ((row.total_score / row.max_score) * 100).toFixed(2)
    );

    return {
      analysis_id: row.analysis_id,
      department: row.department_name,
      student_name: row.student_name,
      category: row.category,
      exam_name: row.exam_name,
      total_score: row.total_score,
      max_score: row.max_score,
      attempted: row.attempted,
      date: formatDate(row.created_at),
      percentage
    };
  });
};

/*
TEST COMPLETION
*/
const testCompletion = async (student_id) => {

  const result = await dbWrite.raw(`
    SELECT 
        COUNT(DISTINCT sa.exam_id) AS attempted,
        COUNT(DISTINCT e.exam_id) AS total
    FROM users u
    LEFT JOIN exams e 
        ON u.department = ANY(e.target_branches)
        AND u.year = ANY(e.target_years)
        AND e.status = 'past'
    LEFT JOIN student_analysis sa
        ON sa.exam_id = e.exam_id
        AND sa.student_id = u.user_id
        AND sa.attempted = TRUE
    WHERE u.user_id = ?
    GROUP BY u.user_id
  `, [student_id]);

  return result.rows[0];
};

/*
CHECK STUDENT ANALYSIS
*/
const checkStudentAnalysis = async (exam_id, student_id) => {

  const result = await dbWrite("student_analysis")
    .where({ exam_id, student_id });

  return result.length > 0;
};

/*
INSERT STUDENT ANALYSIS
*/
const insertStudentAnalysis = async (data) => {

  const [result] = await dbWrite("student_analysis")
    .insert({
      exam_id: data.exam_id,
      department_name: data.department_name,
      student_id: data.student_id,
      student_name: data.student_name,
      exam_name: data.exam_name,
      category: data.category,
      total_score: data.total_score,
      max_score: data.max_score,
      attempted: data.attempted
    })
    .returning("*");

  return result;
};

/*
GENERATE STUDENT ANALYSIS
*/
const generateStudentAnalysis = async () => {

  return await dbWrite("results")
    .select("exam_id", "student_id");
};

/*
AVERAGE RESULT OF STUDENT
*/
const avgResults = async (student_id) => {

  const result = await dbWrite.raw(`
      SELECT 
          student_id,
          ROUND(AVG(total_score),2) AS average_score,
          MAX(max_score) AS max_possible_score
      FROM results
      WHERE student_id = ?
      GROUP BY student_id
  `, [student_id]);

  return result.rows[0];
};

/*
GET STUDENT RANK
*/
const getStudentRank = async (student_id) => {

  const result = await dbWrite("rank")
    .where({ student_id })
    .first();

  return result || null;
};

/*
USER ANALYSIS BY YEAR
*/
const user_analysis = async (year) => {

  const result = await dbWrite.raw(`
      SELECT 
        r.student_id,
        r.student_name,
        r.department_name,
        r.year,
        r.overall_rank,
        r.department_rank,
        ua.total_score,
        ua.max_score,
        ua.accuracy_rate,
        ua.completion_rate,
        ua.category,
        ua.performance_over_time,
        ua.updated_at
      FROM rank r
      JOIN user_analysis ua
      ON r.student_id = ua.student_id
      WHERE r.year = ?
  `,[year]);

  return result.rows;
};

/*
DEPARTMENT USER ANALYSIS
*/
const dept_user_analysis = async (department) => {

  const result = await dbWrite.raw(`
      SELECT 
        r.student_id,
        ua.student_name,
        r.department_name,
        r.year,
        r.overall_rank,
        r.department_rank,
        ua.total_score,
        ua.max_score,
        ua.accuracy_rate,
        ua.completion_rate,
        ua.category,
        ua.performance_over_time,
        ua.updated_at
      FROM rank r
      JOIN user_analysis ua
      ON r.student_id = ua.student_id
      WHERE r.department_name = ?
  `,[department]);

  return result.rows;
};

/*
DEPARTMENT AVG SCORES
*/
const getDeptAvgScores = async (year) => {

  const result = await dbWrite.raw(`
      SELECT 
        department_name,
        ROUND(
          CASE 
            WHEN student_count = 0 THEN 0
            ELSE (total_score / student_count)::numeric
          END,2
        ) AS avg_score
      FROM department_analysis
      WHERE year = ?
      ORDER BY avg_score DESC
  `,[year]);

  return result.rows;
};

/*
PERFORMANCE OVER TIME (DEPARTMENTS)
*/
const getAllDepartmentsPerformanceOverTime = async () => {

  const result = await dbWrite("department_analysis")
    .select("department_name","performance_over_time")
    .orderBy("department_rank","asc");

  return result;
};

/*
OVERALL ACCURACY RATE
*/
const overallAccuracyRate = async (year) => {

  const result = await dbWrite.raw(`
      SELECT 
        ROUND(AVG(accuracy_rate)::numeric,4)
        AS overall_accuracy_rate
      FROM department_analysis
      WHERE year = ?
  `,[year]);

  return result.rows[0]?.overall_accuracy_rate || 0;
};

/*
SINGLE USER ANALYSIS
*/
const getSingleUserAnalysis = async (student_id, department_name, year) => {

  const result = await dbWrite.raw(`
      SELECT 
        r.student_id,
        r.department_name,
        r.year,
        r.overall_rank,
        r.department_rank,
        ua.total_score,
        ua.max_score,
        ua.accuracy_rate,
        ua.completion_rate,
        ua.category,
        ua.performance_over_time,
        ua.updated_at
      FROM rank r
      JOIN user_analysis ua
        ON r.student_id = ua.student_id
        AND r.department_name = ua.department_name
        AND r.year = ua.year
      WHERE r.student_id = ?
      AND r.department_name = ?
      AND r.year = ?
  `,[student_id,department_name,year]);

  return result.rows[0] || null;
};

/*
PERFORMANCE OVER TIME (STUDENT)
*/
const getPerformanceOverTime = async (student_id) => {

  const result = await dbWrite.raw(`
      SELECT 
          sa.student_id,
          sa.exam_id,
          sa.exam_name,
          sa.department_name AS department,
          ROUND(AVG(sa.total_score)::NUMERIC,0) AS average_score,
          TO_CHAR(e.created_at,'DD Mon-YYYY') AS created_on
      FROM student_analysis sa
      JOIN exams e
      ON sa.exam_id = e.exam_id
      WHERE sa.student_id = ?
      GROUP BY sa.student_id, sa.exam_id, sa.exam_name,
               sa.department_name, e.created_at
      ORDER BY e.created_at DESC
      LIMIT 5
  `,[student_id]);

  return result.rows;
};

module.exports = {
  getDepartmentAnalysis,
  deptTopScorers,
  deptWeakScorers,
  topScorers,
  weakScorers,
  getUserAnalysisById,
  getOverallResultsOfAStudent,
  getResultOfAParticularExam,
  testCompletion,
  checkStudentAnalysis,
  insertStudentAnalysis,
  generateStudentAnalysis,
  avgResults,
  getStudentRank,
  user_analysis,
  dept_user_analysis,
  getDeptAvgScores,
  getAllDepartmentsPerformanceOverTime,
  overallAccuracyRate,
  getSingleUserAnalysis,
  getPerformanceOverTime
};
