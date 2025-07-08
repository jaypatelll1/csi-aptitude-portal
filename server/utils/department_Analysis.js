const { query } = require('../config/db');

async function department_analysis(studentAnalysis, examId) {
  try {
    const {
      student_id,
      department_name,
      year,
      accuracy_rate,
      category,
      performance_over_time,
      total_score,
      max_score,
    } = studentAnalysis;

// console.log("studentAnalysis",studentAnalysis);

    if (!department_name || !year) {
      throw new Error('department_name or year is missing');
    }

    // Safely parse if passed as string
    const studentCategory = typeof category === 'string' ? JSON.parse(category) : category || {};
    const studentPerformance = typeof performance_over_time === 'string'
      ? JSON.parse(performance_over_time)
      : performance_over_time || [];

    const existing = await query(
      `SELECT * FROM department_analysis WHERE department_name = $1 AND year = $2`,
      [department_name, year]
    );

    let subjectPerf = {};
    let performance = [];
    let totalScore = Number(total_score) || 0;
    let totalMaxScore = Number(max_score) || 0;
    let accuracySum = Number(accuracy_rate) || 0;
    let studentCount = 1;

    if (existing.rows.length > 0) {
      const data = existing.rows[0];

      try {
        subjectPerf = typeof data.subject_performance === 'string'
          ? JSON.parse(data.subject_performance)
          : data.subject_performance || {};
      } catch {
        subjectPerf = {};
      }

      try {
        performance = typeof data.performance_over_time === 'string'
          ? JSON.parse(data.performance_over_time)
          : data.performance_over_time || [];
      } catch {
        performance = [];
      }

      totalScore += Number(data.total_score) || 0;
      totalMaxScore += Number(data.max_score) || 0;
      accuracySum += Number(data.accuracy_rate) || 0;
      studentCount = (Number(data.student_count) || 0) + 1;
    }

    // Merge subject/category scores
    for (const subject in studentCategory) {
      const { score = 0, max_score = 0 } = studentCategory[subject];
      if (!subjectPerf[subject]) {
        subjectPerf[subject] = { score: 0, max_score: 0 };
      }
      subjectPerf[subject].score += Number(score);
      subjectPerf[subject].max_score += Number(max_score);
    }

    // Update performance_over_time for current exam
    const existingIndex = performance.findIndex(e => e.exam_id == examId);
    const examEntry = {
      exam_id: examId,
      avg_score: Number(total_score),
      max_score: Number(max_score)
    };

    if (existingIndex !== -1) {
      performance[existingIndex] = examEntry;
    } else {
      performance.push(examEntry);
    }

    const finalAccuracy = totalMaxScore > 0 ? totalScore / totalMaxScore : 0;

    if (existing.rows.length > 0) {
      // UPDATE
      await query(
        `UPDATE department_analysis SET
          accuracy_rate = $1,
          subject_performance = $2,
          performance_over_time = $3,
          total_score = $4,
          max_score = $5,
          student_count = $6,
          updated_at = NOW()
        WHERE department_name = $7 AND year = $8`,
        [
          finalAccuracy,
          JSON.stringify(subjectPerf),
          JSON.stringify(performance),
          totalScore,
          totalMaxScore,
          studentCount,
          department_name,
          year
        ]
      );
    } else {
      // INSERT
      await query(
        `INSERT INTO department_analysis (
          department_name, year, accuracy_rate, subject_performance,
          performance_over_time, total_score, max_score, student_count, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [
          department_name,
          year,
          finalAccuracy,
          JSON.stringify(subjectPerf),
          JSON.stringify(performance),
          totalScore,
          totalMaxScore,
          studentCount
        ]
      );
    }

    console.log(`✅ Department analysis updated for ${department_name} - ${year}`);
  } catch (err) {
    console.error('❌ Error in department_analysis:', err);
  }
}

module.exports = { department_analysis };
