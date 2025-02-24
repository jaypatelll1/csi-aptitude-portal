const { query } = require('../config/db');

const getOverallResultsOfAStudent = async (student_id) => {
  try {
    const queryText = `SELECT * FROM student_analysis WHERE attempted=true AND student_id=$1 ORDER BY created_at DESC;`;
    const result = await query(queryText, [student_id]);

    // Helper function to format date to readable format
    const formatToReadableDate = (isoString) => {
      const date = new Date(isoString);
      const options = { day: '2-digit', month: 'short', year: 'numeric' };
      return date.toLocaleDateString('en-IN', options);
    };

    // Calculate status for each result
    const resultsWithPercentage = result.rows.map((row) => {
      const percentage = ((row.total_score / row.max_score) * 100).toFixed(2); // Up to 3 decimal places
      return {
        analysis_id: row.analysis_id,
        department: row.department_name,
        student_name: row.student_name,
        category: row.category,
        exam_name: row.exam_name,
        total_score: row.total_score,
        max_score: row.max_score,
        attempted: row.attempted,
        exam_name: row.exam_name,
        Date: formatToReadableDate(row.created_at), // Format date
        percentage: Number(percentage), // Include calculated percentage
      };
    });

    return resultsWithPercentage;
  } catch (error) {
    console.log(error);
  }
};

const getResultOfAParticularExam = async (student_id, exam_id) => {
  try {
    const queryText = `SELECT * FROM student_analysis WHERE attempted=true AND student_id=$1 AND exam_id=$2;`;
    const result = await query(queryText, [student_id, exam_id]);

    // Helper function to format date to readable format
    const formatToReadableDate = (isoString) => {
      const date = new Date(isoString);
      const options = { day: '2-digit', month: 'short', year: 'numeric' };
      return date.toLocaleDateString('en-IN', options);
    };

    // Calculate status for each result
    const resultsWithPercentage = result.rows.map((row) => {
      const percentage = ((row.total_score / row.max_score) * 100).toFixed(2); // Up to 3 decimal places
      return {
        analysis_id: row.analysis_id,
        department: row.department_name,
        student_name: row.student_name,
        category: row.category,
        exam_name: row.exam_name,
        total_score: row.total_score,
        max_score: row.max_score,
        attempted: row.attempted,
        exam_name: row.exam_name,
        Date: formatToReadableDate(row.created_at), // Format date
        percentage: Number(percentage), // Include calculated percentage
      };
    });

    return resultsWithPercentage;
  } catch (error) {
    console.log(error);
  }
};

const testCompletion = async (student_id) => {
  try {
    const attemptedResult = await query(
      `SELECT * FROM student_analysis WHERE student_id=$1 AND attempted=TRUE;`,
      [student_id]
    );
    const totalResult = await query(
      `SELECT * FROM exams 
       WHERE 
        (SELECT department FROM users WHERE user_id = $1) = ANY(target_branches) 
       AND 
        (SELECT year FROM users WHERE user_id = $2) = ANY(target_years)
       AND
       status=$3;
      `,
      [student_id, student_id, 'past']
    );

    const result = {
      attempted: attemptedResult.rowCount,
      total: totalResult.rowCount,
    };

    return result;
  } catch (error) {
    console.log(error);
  }
};

// Check if student analysis already exists
async function checkStudentAnalysis(exam_id, student_id) {
  try {
    const sql = `
          SELECT * FROM student_analysis 
          WHERE exam_id = $1 AND student_id = $2;
      `;

    const result = await query(sql, [exam_id, student_id]);
    return result.rows.length > 0; // Returns true if entry exists, false otherwise
  } catch (error) {
    console.error('Error checking student analysis:', error);
    throw error;
  }
}

async function insertStudentAnalysis(data) {
  try {
    const sql = `
            INSERT INTO student_analysis (
                exam_id, department_name, student_id, student_name, exam_name, 
                category, total_score, max_score, attempted
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;

    const values = [
      data.exam_id,
      data.department_name,
      data.student_id,
      data.student_name,
      data.exam_name,
      data.category,
      data.total_score,
      data.max_score,
      data.attempted,
    ];

    const result = await query(sql, values);
    return result.rows[0]; // Return the inserted row
  } catch (error) {
    console.error('Error inserting student analysis:', error);
    throw error;
  }
}

const generateStudentAnalysis = async () => {
  try {
    const queryText = `SELECT exam_id, student_id FROM results`;
    const result = await query(queryText);
    return result.rows;
  } catch (error) {
    console.log(error);
  }
};

const avgResults = async (student_id) => {
  try {
    const queryText = `
      SELECT 
          student_id, 
          ROUND(AVG(total_score), 2) AS average_score,
          MAX(max_score) AS max_possible_score
      FROM results
      WHERE student_id = $1
      GROUP BY student_id;
    `;
    const result = await query(queryText, [student_id])
    return result.rows[0];
  } catch (error) {
    console.log(error)
  }
};

async function getStudentRank(student_id) {
  try {
    const result = await query(`SELECT * FROM student_rank WHERE student_id=$1;`, [student_id]);
    return result.rows[0]; 
  } catch (error) {
    console.error('Error returning student rank:', error);
    throw error;
  }
}

module.exports = {
  getOverallResultsOfAStudent,
  getResultOfAParticularExam,
  testCompletion,
  insertStudentAnalysis,
  checkStudentAnalysis,
  generateStudentAnalysis,
  avgResults,
  getStudentRank
};
