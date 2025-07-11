const { query } = require('../config/db');

// ✅ Generate Student Ranks
async function generateStudentRanks() {
  try {
    // Step 1: Fetch all students with total_score > 0
    const res = await query(`
      SELECT student_id, student_name, department_name, year, total_score
      FROM user_analysis
      WHERE total_score IS NOT NULL AND total_score > 0
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

    // Step 3: Department rank (by department + year)
    const deptGroups = {};
    for (const student of students) {
      const deptKey = `${student.department_name}_${student.year}`;
      if (!deptGroups[deptKey]) deptGroups[deptKey] = [];
      deptGroups[deptKey].push(student);
    }

    for (const deptKey in deptGroups) {
      const group = deptGroups[deptKey];
      group.sort((a, b) => b.total_score - a.total_score);

      let currentRank = 1;
      for (let i = 0; i < group.length; i++) {
        if (i > 0 && group[i].total_score === group[i - 1].total_score) {
          group[i].department_rank = group[i - 1].department_rank;
        } else {
          group[i].department_rank = currentRank;
        }
        currentRank++;
      }

      // ✅ Debug output for verification
      console.log(`📊 Department-Year: ${deptKey}`);
      group.forEach((s) =>
        console.log(`  ${s.student_name} — Score: ${s.total_score}, Dept Rank: ${s.department_rank}`)
      );
    }

    // Step 4: Insert or update into rank table
    for (const student of students) {
      await query(
        `
        INSERT INTO rank (
          student_id, student_name, department_name, year,
          total_score, overall_rank, department_rank, last_updated
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
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

    // Optional: Update department_analysis table
    await generateDepartmentRanks();

  } catch (err) {
    console.error(`❌ Error in generateStudentRanks:`, err);
  }
}
// // 🔁 Immediate execution block to clean and regenerate ranks
// (async () => {
//   try {
//     console.log("🧹 Deleting old rank data...");
//     await query(`DELETE FROM rank`);
//     console.log("✅ Old rank data deleted.");
    
//     await generateStudentRanks();
//   } catch (err) {
//     console.error("❌ Error while generating ranks:", err);
//   }
// })();

// ✅ Generate Department Rank (for department_analysis table)
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

// ✅ Get Student Ranks (Admin filter)
async function getStudentRanksInOrder(data) {
  try {
    let queryText = 'SELECT * FROM student_rank';
    let queryParams = [];

    if (data.department) {
      queryText += ' WHERE department_name = $1';
      queryParams.push(data.department);
    }

    if (data.filter === "top-performers") {
      queryText += ' ORDER BY ' + (data.department ? 'department_rank ASC' : 'overall_rank ASC');
    } else if (data.filter === "bottom-performers") {
      queryText += ' ORDER BY ' + (data.department ? 'department_rank DESC' : 'overall_rank DESC');
    } else {
      queryText += ' ORDER BY ' + (data.department ? 'department_rank ASC' : 'overall_rank ASC');
    }

    console.log(queryText, queryParams);

    const result = await query(queryText, queryParams);
    return result.rows;

  } catch (error) {
    console.log('❌ Error fetching student rank data:', error);
  }
}

// ✅ Get Student Analysis for TPO
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
    console.log('❌ Error fetching TPO data:', error);
    return [];
  }
}

module.exports = {
  generateStudentRanks,
  generateDepartmentRanks,
  getStudentRanksInOrder,
  getStudentRanksInOrderTpo,
};
