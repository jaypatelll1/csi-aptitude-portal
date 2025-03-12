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

    queryText = `DELETE FROM student_rank;`;
    await query(queryText);

    results.map(async (ranking) => {
      let { student_id, student_name, department, total_score, overall_rank, department_rank } = ranking;

      queryText = `INSERT INTO student_rank (student_id, student_name, department_name, total_score, overall_rank, department_rank)
        VALUES ($1, $2, $3, $4, $5, $6);`;

      await query(queryText, [student_id, student_name, department, total_score, overall_rank, department_rank]);
    });
    return results.rows;
  } catch (error) {
    console.log(error);
  }
};

async function getStudentRanksInOrder(data) {
  try {

    let queryText = "SELECT * FROM student_rank";
    let queryParams = [];

    if (data.department) {
      queryText += " WHERE department_name = $1";
      queryParams.push(data.department);
    }

    if (data.filter === "top-performers") {
      queryText += data.department ? " ORDER BY department_rank ASC" : " ORDER BY  overall_rank ASC";
    } else if (data.filter === "bottom-performers") {
      queryText += data.department ? " ORDER BY department_rank DESC" : " ORDER BY  overall_rank DESC";
    } else {
      queryText += data.department ? " ORDER BY department_rank ASC" : " ORDER BY  overall_rank ASC";
    }
    console.log(queryText,queryParams)
    if(data.department){
    const result = await query(queryText, queryParams);
    return result.rows;
    }else{
      const result = await query(queryText);
      return result.rows;
    }
    
  } catch (error) {
    console.log("Error fetching data", error);
  }
}


module.exports = { generateRank, getStudentRanksInOrder };
