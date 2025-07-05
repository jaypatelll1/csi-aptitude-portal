const { query } = require('../config/db');

const generateRank = async () => {
  try {
    let queryText = `SELECT 
          student_id,
          student_name,
          department_name AS department,
          SUM(total_score) AS total_score,
          RANK() OVER (ORDER BY SUM(total_score) DESC, student_id) AS overall_rank,
          RANK() OVER (PARTITION BY department_name ORDER BY SUM(total_score) DESC, student_id) AS department_rank
        FROM student_analysis
        GROUP BY student_id, student_name, department_name
        ORDER BY department_name, department_rank, overall_rank;
      `;
    let results = await query(queryText);
    results = results.rows;

    for (const ranking of results) {
      const {
        student_id,
        student_name,
        department,
        total_score,
        overall_rank,
        department_rank,
      } = ranking;
      // console.log(student_id, student_name, department, total_score, overall_rank, department_rank);
      try {
        queryText = `
          INSERT INTO student_rank (student_id, student_name, department_name, total_score,overall_rank,department_rank, last_updated)
          VALUES ($1,$2,$3,$4,$5,$6, CURRENT_TIMESTAMP)
          ON CONFLICT (student_id) 
          DO UPDATE SET 
            student_name = EXCLUDED.student_name,
            department_name = EXCLUDED.department_name,
            total_score = EXCLUDED.total_score,
            overall_rank = EXCLUDED.overall_rank,
            department_rank = EXCLUDED.department_rank,
            last_updated = CURRENT_TIMESTAMP;
        `;

        await query(queryText, [
          student_id,
          student_name,
          department,
          total_score,
          overall_rank,
          department_rank,
        ]);

        // console.log(`Rank updated succesfully for ${student_id}`);
      } catch (updateError) {
        console.log(typeof student_id);
        console.error(
          `Error updating/inserting student_id ${student_id}:`,
          updateError
        );
      }
    }

    return results;
  } catch (error) {
    console.log(error);
  }
};

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
        sr.department_name AS "department",
        sr.department_rank AS "department_rank",
        sr.overall_rank AS "overall_rank",
        sr.total_score AS "total_score",
        u.email AS "email",
        u.phone AS "phone"
      FROM student_rank sr
      JOIN users u ON sr.student_id = u.user_id
      WHERE u.year = 'BE'`;

    const queryParams = [];
    let paramIndex = 1;

    if (data.department) {
      queryText += ` AND sr.department_name = $${paramIndex}`;
      queryParams.push(data.department);
      paramIndex++;
    }

    if (data.filter === "top-performers") {
      queryText += data.department 
        ? ` ORDER BY sr.department_rank ASC` 
        : ` ORDER BY sr.overall_rank ASC`;
    } else if (data.filter === "bottom-performers") {
      queryText += data.department 
        ? ` ORDER BY sr.department_rank DESC` 
        : ` ORDER BY sr.overall_rank DESC`;
    } else {
      queryText += data.department 
        ? ` ORDER BY sr.department_rank ASC` 
        : ` ORDER BY sr.overall_rank ASC`;
    }

    console.log(queryText, queryParams);
    const result = await query(queryText, queryParams);
    return result.rows;

  } catch (error) {
    console.log('Error fetching data', error);
    return [];
  }
}


module.exports = { generateRank, getStudentRanksInOrder, getStudentRanksInOrderTpo };
