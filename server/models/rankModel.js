const { query } = require('../config/db');

const generateRank = async () => {
  try {
    let queryText = `SELECT 
          student_id,
          student_name,
          department_name AS department,
          SUM(total_score) AS total_score,
          RANK() OVER (ORDER BY SUM(total_score) DESC) AS overall_rank,
          RANK() OVER (PARTITION BY department_name ORDER BY SUM(total_score) DESC) AS department_rank
        FROM student_analysis
        GROUP BY student_id, student_name, department_name
        ORDER BY department_name, department_rank, overall_rank;
      `;
    let results = await query(queryText);
    results = results.rows;

    for (const ranking of results) {
      const { student_id, student_name, department, total_score, overall_rank, department_rank } = ranking;

      try {
        queryText = `
          INSERT INTO student_rank (student_id, student_name, department_name, total_score, overall_rank, department_rank, last_updated)
          VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
          ON CONFLICT (student_id) 
          DO UPDATE SET 
            student_name = EXCLUDED.student_name,
            department_name = EXCLUDED.department_name,
            total_score = EXCLUDED.total_score,
            overall_rank = EXCLUDED.overall_rank,
            department_rank = EXCLUDED.department_rank,
            last_updated = CURRENT_TIMESTAMP;
        `;

        await query(queryText, [student_id, student_name, department, total_score, overall_rank, department_rank]);
      } catch (updateError) {
        console.error(`Error updating/inserting student_id ${student_id}:`, updateError);
      }
    }

    return results;
  } catch (error) {
    console.error('Error generating ranks:', error);
  }
};

module.exports = { generateRank };
