const { query } = require('../config/db');

async function department_analysis(studentAnalysis, examId,examName) {
  try {
    const {
      department_name,
      year,
      accuracy_rate,
      category,
      performance_over_time,
      total_score,
      max_score,
    } = studentAnalysis;
    console.log(examName)

    if (!department_name || !year) {
      throw new Error('department_name or year is missing');
    }

    const studentCategory = typeof category === 'string' ? JSON.parse(category) : category || {};
    const examEntry = {
      exam_id: examId,
      avg_score: Number(total_score) || 0,
      max_score: Number(max_score) || 0,
      date: new Date().toISOString().slice(0, 10),
      exam:examName

    };

    // Get current data if it exists (to merge)
    const result = await query(
      `SELECT * FROM department_analysis WHERE department_name = $1 AND year = $2`,
      [department_name, year]
    );

    let subjectPerf = {};
    let performance = [];
    let totalScore = Number(total_score) || 0;
    let totalMaxScore = Number(max_score) || 0;
    let studentCount = 1;

    if (result.rows.length > 0) {
      const existing = result.rows[0];

      try {
        subjectPerf = typeof existing.subject_performance === 'string'
          ? JSON.parse(existing.subject_performance)
          : existing.subject_performance || {};
      } catch {
        subjectPerf = {};
      }

      try {
        performance = typeof existing.performance_over_time === 'string'
          ? JSON.parse(existing.performance_over_time)
          : existing.performance_over_time || [];
      } catch {
        performance = [];
      }

      // Merge previous data
      totalScore += Number(existing.total_score) || 0;
      totalMaxScore += Number(existing.max_score) || 0;
      studentCount = (Number(existing.student_count) || 0) + 1;

      // Merge subject performance
      for (const subject in studentCategory) {
        const { score = 0, max_score = 0 } = studentCategory[subject];
        if (!subjectPerf[subject]) {
          subjectPerf[subject] = { score: 0, max_score: 0 };
        }
        subjectPerf[subject].score += Number(score);
        subjectPerf[subject].max_score += Number(max_score);
      }

      // Merge performance over time
      const index = performance.findIndex(e => e.exam_id == examId);
      if (index !== -1) {
        performance[index] = examEntry;
      } else {
        performance.push(examEntry);
      }
    } else {
      // First entry for this department-year
      subjectPerf = studentCategory;
      performance = [examEntry];
    }

    const finalAccuracy = totalMaxScore > 0 ? totalScore / totalMaxScore : 0;

    // UPSERT
    await query(
      `INSERT INTO department_analysis (
        department_name, year, accuracy_rate, subject_performance,
        performance_over_time, total_score, max_score, student_count, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (department_name, year)
      DO UPDATE SET
        accuracy_rate = EXCLUDED.accuracy_rate,
        subject_performance = EXCLUDED.subject_performance,
        performance_over_time = EXCLUDED.performance_over_time,
        total_score = EXCLUDED.total_score,
        max_score = EXCLUDED.max_score,
        student_count = EXCLUDED.student_count,
        updated_at = NOW();`,
      [
        department_name,
        year,
        finalAccuracy,
        JSON.stringify(subjectPerf),
        JSON.stringify(performance),
        totalScore,
        totalMaxScore,
        studentCount,
      ]
    );

    console.log(`✅ Department analysis updated for ${department_name} - ${year}`);
  } catch (err) {
    console.error('❌ Error in department_analysis:', err.message);
  }
}

module.exports = { department_analysis };
