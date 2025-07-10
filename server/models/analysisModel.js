const { query } = require('../config/db');


const getDepartmentAnalysis = async (department_name, year) => {
  let baseQuery = `SELECT * FROM department_analysis`;
  const values = [];
  const conditions = [];

  if (department_name) {
    conditions.push(`department_name = $${values.length + 1}`);
    values.push(department_name);
  }

  if (year) {
    conditions.push(`year = $${values.length + 1}`);
    values.push(year);
  }

  if (conditions.length > 0) {
    baseQuery += ` WHERE ` + conditions.join(' AND ');
  }

  baseQuery += ` ORDER BY department_rank ASC`;

  const result = await query(baseQuery, values);
  return result.rows;
};

const deptTopScorers = async (department) => {
  try {
    const result = await query(`
      SELECT * 
      FROM rank 
      WHERE department_name = $1
      ORDER BY overall_rank ASC 
      LIMIT 5;
    `, [department]);
    return result.rows;
  } catch (error) {
    console.log('Error in topScorers:', error);
    throw error;
  }
};

const deptWeakScorers = async (department) => {
  try {
    const result = await query(`
      SELECT * FROM (
        SELECT * 
        FROM student_rank 
        WHERE department_name = $1
        ORDER BY overall_rank DESC 
        LIMIT 5
        ) AS subquery
        ORDER BY overall_rank ASC;
        `, [department]);
    return result.rows;
  } catch (error) {
    console.log('Error in weakScorers:', error);
    throw error;
  }
};



const getUserAnalysisById = async (student_id) => {
  const queryText = `
        SELECT * FROM user_analysis
        WHERE student_id = $1
      `;

  const result = await query(queryText, [student_id]);
  return result.rows[0]; // return single object
};




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
      const percentage = Math.round((row.total_score / row.max_score) * 100); // Up to 3 decimal places
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
    const result = await query(queryText, [student_id]);
    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
};

async function getStudentRank(student_id) {
  try {
    const result = await query(
      `SELECT * FROM rank WHERE student_id=$1;`,
      [student_id]
    );
    if (!result.rows === 0) {
      return;
    }
    return result.rows[0];
  } catch (error) {
    console.error('Error returning student rank:', error);
    throw error;
  }
}


async function user_analysis(year) {
  try {
    const queryText = `
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
      FROM rank AS r
      JOIN user_analysis AS ua ON r.student_id = ua.student_id
      WHERE r.year = $1;
    `;

    const result = await query(queryText, [year]);
    return result.rows;
  } catch (error) {
    console.error('❌ Error fetching user analysis:', error);
    throw error;
  }
}


async function dept_user_analysis(department) {
  try {
    const queryText = `
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
      FROM rank AS r
      JOIN user_analysis AS ua ON r.student_id = ua.student_id
      WHERE r.department_name = $1;
    `;

    const result = await query(queryText, [department]);
    return result.rows;
  } catch (error) {
    console.error('❌ Error fetching user analysis:', error);
    throw error;
  }
}




const topScorers = async (year) => {
  try {
    const result = await query(`
      SELECT * 
      FROM rank 
      WHERE year = $1
      ORDER BY overall_rank ASC 
      LIMIT 5;
    `, [year]);
    return result.rows;
  } catch (error) {
    console.log('Error in topScorers:', error);
    throw error;
  }
};

const weakScorers = async (year) => {
  try {
    const result = await query(`
      SELECT * FROM (
        SELECT * 
        FROM student_rank 
        WHERE year = $1
        ORDER BY overall_rank DESC 
        LIMIT 5
      ) AS subquery
      ORDER BY overall_rank ASC;
    `, [year]);
    return result.rows;
  } catch (error) {
    console.log('Error in weakScorers:', error);
    throw error;
  }
};


const getDeptAvgScores = async (year) => {
  try {
    const result = await query(
      `
      SELECT 
        department_name,
        ROUND(
          CASE 
            WHEN student_count = 0 THEN 0
            ELSE (total_score / student_count)::numeric
          END, 2
        ) AS avg_score
      FROM 
        department_analysis
      WHERE 
        year = $1
      ORDER BY 
        avg_score DESC;
      `,
      [year] // <-- parameterized input
    );
    return result.rows;
  } catch (error) {
    console.log('Error fetching department average scores:', error);
    throw error;
  }
};

const getAllDepartmentsPerformanceOverTime = async () => {
  try {
    const result = await query(`
      SELECT department_name, performance_over_time 
      FROM department_analysis
      ORDER BY department_rank ASC;
    `);
    return result.rows; // Array of { department_name, performance_over_time }
  } catch (error) {
    console.error('Error fetching performance over time:', error);
    throw error;
  }
};
const overallAccuracyRate = async (year) => {
  try {
    const sql = `
      SELECT ROUND(AVG(accuracy_rate)::numeric, 4) AS overall_accuracy_rate
      FROM department_analysis
      WHERE year = $1;
    `;
    const result = await query(sql, [year]);
    return result.rows[0]?.overall_accuracy_rate || 0.0;
  } catch (error) {
    console.error('❌ Error fetching overall accuracy rate:', error.message);
    throw error;
  }
};


async function getSingleUserAnalysis(student_id, department_name, year) {
  try {
    const sql = `
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
      FROM rank AS r
      JOIN user_analysis AS ua 
        ON r.student_id = ua.student_id 
        AND r.department_name = ua.department_name 
        AND r.year = ua.year
      WHERE r.student_id = $1 AND r.department_name = $2 AND r.year = $3;
    `;

    const result = await query(sql, [student_id, department_name, year]);

    if (result.rows.length === 0) {
      return null; // or []
    }

    return result.rows[0];
  } catch (error) {
    console.error('❌ Error in getStudentCombinedAnalysis:', error.message);
    throw error;
  }
}





async function getPerformanceOverTime(student_id) {
  try {
    const result = await query(`
      SELECT 
          sa.student_id,
          sa.exam_id, 
          sa.exam_name, 
          sa.department_name AS department, 
          ROUND(AVG(sa.total_score)::NUMERIC, 0) AS average_score,
          TO_CHAR(e.created_at, 'DD Mon-YYYY') AS created_on
      FROM student_analysis sa
      JOIN exams e ON sa.exam_id = e.exam_id
      WHERE sa.student_id = $1
      GROUP BY sa.student_id, sa.exam_id, sa.exam_name, sa.department_name, e.created_at
      ORDER BY e.created_at DESC  -- Get the latest exams first
      LIMIT 5;
`,
      [student_id]
    );
    return result.rows;
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
  getStudentRank,
  getPerformanceOverTime,
  getDepartmentAnalysis, //---------------
  deptTopScorers,
  deptWeakScorers,
  getUserAnalysisById, //---------------
  user_analysis,
  dept_user_analysis,
  getSingleUserAnalysis,
  topScorers,
  weakScorers,
  getDeptAvgScores,
  getAllDepartmentsPerformanceOverTime,
  overallAccuracyRate,
};
