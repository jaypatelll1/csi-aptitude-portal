const { query } = require('../config/db');

async function generateStudentRanks() {
  try {
    // Step 1: Fetch all students with total_score
    const res = await query(`
      SELECT student_id, student_name, department_name, year, total_score
      FROM user_analysis
      WHERE total_score IS NOT NULL
    `);

    const students = res.rows;

    if (students.length === 0) {
      console.log("⚠️ No students found with scores to rank.");
      return;
    }

    // Step 2: Overall rank
    students.sort((a, b) => b.total_score - a.total_score);
    students.forEach((student, index) => {
      student.overall_rank = index + 1;
    });

    // Step 3: Department rank
    const deptGroups = {};
    for (const student of students) {
      const dept = student.department_name;
      if (!deptGroups[dept]) deptGroups[dept] = [];
      deptGroups[dept].push(student);
    }
    for (const dept in deptGroups) {
      deptGroups[dept].sort((a, b) => b.total_score - a.total_score);
      deptGroups[dept].forEach((student, index) => {
        student.department_rank = index + 1;
      });
    }

    // Step 4: Insert or update rank table
    for (const student of students) {
      await query(
        `
        INSERT INTO rank (
          student_id, student_name, department_name, year,
          total_score, overall_rank, department_rank, last_updated
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, NOW()
        )
        ON CONFLICT (student_id)
        DO UPDATE SET
          student_name = EXCLUDED.student_name,
          department_name = EXCLUDED.department_name,
          year = EXCLUDED.year,
          total_score = EXCLUDED.total_score,
          overall_rank = EXCLUDED.overall_rank,
          department_rank = EXCLUDED.department_rank,
          last_updated = NOW()
        `,
        [
          student.student_id,
          student.student_name,
          student.department_name,
          student.year,
          student.total_score,
          student.overall_rank,
          student.department_rank
        ]
      );
    }

    console.log(`✅ Successfully inserted/updated ranks for ${students.length} students.`);
  } catch (err) {
    console.error(`❌ Error in generateStudentRanks:`, err);
  }
}

async function generateDepartmentRanks() {
  try {
    await query(`
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
      WHERE
        department_analysis.department_name = ranked.department_name
        AND department_analysis.year = ranked.year
    `);

    console.log('✅ Department ranks generated successfully.');
  } catch (err) {
    console.error('❌ Error generating department ranks:', err);
  }
}


async function getStudentRanksInOrder(data) {
  try {
    let queryText = 'SELECT * FROM student_rank WHERE  ';
    let queryParams = [];

    if (data.department) {
      queryText += '  department_name = $1';
      queryParams.push(data.department);
    }
//     SELECT 
//     u.user_id AS "User ID",
//     u.name AS "Name",
//     sr.department_name AS "Department",
//     sr.department_rank AS "Dept. Rank",
//     sr.overall_rank AS "Overall Rank"
// FROM student_rank sr
// JOIN users u ON sr.student_id = u.user_id
// WHERE u.year = 'BE'
// ORDER BY sr.overall_rank ASC;


    if (data.filter === "top-performers") {
      queryText += data.department ? " ORDER BY department_rank ASC" : " ORDER BY  overall_rank ASC";
    } else if (data.filter === "bottom-performers") {
      queryText += data.department ? " ORDER BY department_rank DESC" : " ORDER BY  overall_rank DESC";
    } else {
      queryText += data.department ? " ORDER BY department_rank ASC" : " ORDER BY  overall_rank ASC";
    }
    console.log(queryText, queryParams);
    if (data.department) {
      const result = await query(queryText, queryParams);
      return result.rows;
    } else {
      const result = await query(queryText);
      return result.rows;
    }
  } catch (error) {
    console.log('Error fetching data', error);
  }
}
async function getStudentRanksInOrderTpo(data) {
  try {
    let queryText = `
      SELECT 
        u.user_id AS "user_id",
        u.name AS "name",
        ua.department_name AS "department",
        ua.total_score AS "total_score",
        ua.max_score AS "max_score",
        ua.accuracy_rate AS "accuracy_rate",
        ua.completion_rate AS "completion_rate",
        u.email AS "email",
        u.phone AS "phone"
      FROM user_analysis ua
      JOIN users u ON ua.student_id = u.user_id
      WHERE u.year = 'BE'`;

    const queryParams = [];
    let paramIndex = 1;

    if (data.department) {
      queryText += ` AND ua.department_name = $${paramIndex}`;
      queryParams.push(data.department);
      paramIndex++;
    }

    if (data.filter === "top-performers") {
      queryText += ` ORDER BY ua.total_score DESC`;
    } else if (data.filter === "bottom-performers") {
      queryText += ` ORDER BY ua.total_score ASC`;
    } else {
      queryText += ` ORDER BY ua.total_score DESC`;
    }

    console.log(queryText, queryParams);
    const result = await query(queryText, queryParams);
    return result.rows;

  } catch (error) {
    console.log('❌ Error fetching data from user_analysis:', error);
    return [];
  }
}



module.exports = { generateStudentRanks, getStudentRanksInOrder,generateDepartmentRanks, getStudentRanksInOrderTpo };
