const { query } = require('../config/db');

const getOverallResultsOfAStudent = async (student_id) => {
  try {
    const queryText = `SELECT * FROM student_analysis WHERE attempted=true AND student_id=$1;`;
    const result = await query(queryText, [student_id]);

    // Helper function to format date to readable format
    const formatToReadableDate = (isoString) => {
      const date = new Date(isoString);
      const options = { day: '2-digit', month: 'short', year: 'numeric' };
      return date.toLocaleDateString('en-IN', options);
    };

    // Calculate status for each result
    const resultsWithPercentage = result.rows.map((row) => {
      const percentage = (row.total_score / row.max_score) * 100; // Up to 3 decimal places
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
      const percentage = (row.total_score / row.max_score) * 100; // Up to 3 decimal places
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
        const attemptedResult = await query(`SELECT * FROM student_analysis WHERE student_id=$1 AND attempted=TRUE;`, [student_id])
        const totalResult = await query(`SELECT * FROM student_analysis WHERE student_id=$1`, [student_id])

        const result = {
            attempted: attemptedResult.rowCount,
            total: totalResult.rowCount
        }
        
        return result;

    } catch (error) {
        console.log(error)
    }
}

module.exports = { getOverallResultsOfAStudent, getResultOfAParticularExam, testCompletion };
