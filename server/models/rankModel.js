const { dbWrite } = require("../config/db");

/*
GENERATE STUDENT RANKS
*/
async function generateStudentRanks() {
  try {

    const students = await dbWrite("user_analysis")
      .select(
        "student_id",
        "student_name",
        "department_name",
        "year",
        "total_score"
      )
      .whereNotNull("total_score")
      .where("total_score", ">", 0);

    if (!students.length) {
      console.log("⚠️ No students found with scores.");
      return;
    }

    const rankedStudents = await dbWrite.raw(`
      SELECT 
        student_id,
        student_name,
        department_name,
        year,
        total_score,

        RANK() OVER (
          ORDER BY total_score DESC
        ) AS overall_rank,

        RANK() OVER (
          PARTITION BY department_name, year
          ORDER BY total_score DESC
        ) AS department_rank

      FROM user_analysis
      WHERE total_score IS NOT NULL AND total_score > 0
    `);

    const rows = rankedStudents.rows;

    for (const student of rows) {
      await dbWrite("rank")
        .insert({
          student_id: student.student_id,
          student_name: student.student_name,
          department_name: student.department_name,
          year: student.year,
          total_score: student.total_score,
          overall_rank: student.overall_rank,
          department_rank: student.department_rank,
          last_updated: dbWrite.fn.now(),
        })
        .onConflict("student_id")
        .merge();
    }

    console.log(`✅ Updated ranks for ${rows.length} students`);

    await generateDepartmentRanks();

  } catch (err) {
    console.error("❌ Error generating student ranks:", err);
  }
}

/*
GENERATE DEPARTMENT RANKS
*/
async function generateDepartmentRanks() {
  try {

    await dbWrite.raw(`
      WITH ranked AS (
        SELECT
          department_name,
          year,
          RANK() OVER (
            PARTITION BY year
            ORDER BY total_score DESC
          ) AS rank
        FROM department_analysis
      )
      UPDATE department_analysis
      SET department_rank = ranked.rank
      FROM ranked
      WHERE department_analysis.department_name = ranked.department_name
      AND department_analysis.year = ranked.year
    `);

    console.log("✅ Department ranks generated");

  } catch (err) {
    console.error("❌ Error generating department ranks:", err);
  }
}

/*
GET STUDENT RANKS (ADMIN)
*/
async function getStudentRanksInOrder(data) {
  try {

    let query = dbWrite("student_rank");

    if (data.department) {
      query = query.where("department_name", data.department);
    }

    if (data.filter === "bottom-performers") {
      query = query.orderBy(
        data.department ? "department_rank" : "overall_rank",
        "desc"
      );
    } else {
      query = query.orderBy(
        data.department ? "department_rank" : "overall_rank",
        "asc"
      );
    }

    const result = await query;

    return result;

  } catch (error) {
    console.log("❌ Error fetching student ranks:", error);
  }
}

/*
GET STUDENT ANALYSIS FOR TPO
*/
async function getStudentRanksInOrderTpo(data) {
  try {

    let query = dbWrite("user_analysis as ua")
      .select(
        "u.user_id as user_id",
        "u.name as name",
        "ua.department_name as department",
        "ua.total_score as total_score",
        "ua.max_score as max_score",
        "ua.accuracy_rate as accuracy_rate",
        "ua.completion_rate as completion_rate",
        "u.email as email",
        "u.phone as phone"
      )
      .join("users as u", "ua.student_id", "u.user_id")
      .where("u.year", "BE");

    if (data.department) {
      query = query.where("ua.department_name", data.department);
    }

    if (data.filter === "bottom-performers") {
      query = query.orderBy("ua.total_score", "asc");
    } else {
      query = query.orderBy("ua.total_score", "desc");
    }

    const result = await query;

    return result;

  } catch (error) {
    console.log("❌ Error fetching TPO data:", error);
    return [];
  }
}

module.exports = {
  generateStudentRanks,
  generateDepartmentRanks,
  getStudentRanksInOrder,
  getStudentRanksInOrderTpo,
};
