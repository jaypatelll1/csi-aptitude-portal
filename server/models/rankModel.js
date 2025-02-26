const { query } = require('../config/db');

const generateRank = async () => {
  try {
    let queryText = `SELECT 
          student_id,
          student_name,
          department_name AS department,
          SUM(total_score) AS total_score,
          RANK() OVER (PARTITION BY department_name ORDER BY SUM(total_score) DESC) AS rank
        FROM student_analysis
        GROUP BY student_id, student_name, department_name
        ORDER BY department_name, rank;
      `;
    let results = await query(queryText);
    results = results.rows;

    queryText = `DELETE FROM student_rank;`;
    await query(queryText);

    results.map(async (ranking) => {
      let { student_id, student_name, department, rank, total_score } = ranking;

      queryText = `INSERT INTO student_rank (student_id, student_name, department_name, rank, total_score)
        VALUES ($1, $2, $3, $4, $5);`;

      await query(queryText, [student_id, student_name, department, rank, total_score]);
    });
    return results;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { generateRank };
