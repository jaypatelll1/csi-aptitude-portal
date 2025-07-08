const { query } = require('../config/db');
const { getResultById ,getAllResults } = require('../models/resultModel');
const { getUserById } = require('../models/userModel');
const { getExamById } = require('../models/examModel');

async function user_analysis(exam_id, student_id,result) {
  try {
    const student = await getUserById(student_id);
    if (!student) throw new Error(`Student not found`);
// 
    if (!result) {
      console.log(`No result found for student ${student_id} and exam ${exam_id}`);
      return;
    }
    console.log("results",result)

    const existingUser = await query(
      `SELECT * FROM user_analysis WHERE student_id = $1`,
      [student_id]
    );

    console.log(existingUser)

    let performance_over_time = [];
    let categoryScoreMap = {};
    let totalScore = 0;
    let totalMaxScore = 0;

    // If student exists, use their existing data
    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];
      performance_over_time = user.performance_over_time || [];
      categoryScoreMap = user.category || {};
      totalScore = user.total_score || 0;
      totalMaxScore = user.max_score || 0;
    }

    // Add latest exam result
    const exam = await getExamById(exam_id);
    console.log(exam)
    performance_over_time.push({
      exam_id: exam.exam_id,
      exam_name: exam?.exam_name || `Exam ${exam_id}`,
      score: result.total_score,
      max_score: result.max_score,
    });

    totalScore += parseInt(result.total_score) || 0;
totalMaxScore += parseInt(result.max_score) || 0;

    // Merge category scores
    const newCatScores = result.category_score;
    
    console.log(newCatScores)
    for (const category in newCatScores) {
      const cs = newCatScores[category];
      if (!categoryScoreMap[category]) {
        categoryScoreMap[category] = { score: 0, max_score: 0 };
      }
      categoryScoreMap[category].score += parseInt(cs.score);
      categoryScoreMap[category].max_score += parseInt(cs.max_score);
    }
console.log(newCatScores)
    const accuracy_rate = totalMaxScore > 0 ? totalScore / totalMaxScore : 0;
console.log(accuracy_rate)
    const totalAssignedRes = await query(
      `SELECT COUNT(*) FROM exams 
       WHERE exam_for = 'Student'
       AND $1 = ANY(target_branches)
       AND $2 = ANY(target_years)`,
      [student.department, student.year]
    );
    const totalAssigned = parseInt(totalAssignedRes.rows[0].count) || 0;
console.log(totalAssigned)

    const attemptedResults = await getAllResults(student_id);
    console.log(attemptedResults)
    const attempted = attemptedResults?.length || 1;
    console.log(attempted)
    const completion_rate = totalAssigned > 0 ? attempted / totalAssigned : 0;
console.log(completion_rate)
    if (existingUser.rows.length === 0) {
      // ✅ INSERT if student doesn't exist
      const insertQuery = `
        INSERT INTO user_analysis (
          student_id, student_name, department_name, year,
          accuracy_rate, completion_rate,
          category, performance_over_time,
          total_score, max_score, updated_at
        ) VALUES (
          $1, $2, $3, $4,
          $5, $6,
          $7, $8,
          $9, $10, NOW()
        )
      `;
      await query(insertQuery, [
        student_id,
        student.name,
        student.department,
        student.year,
        accuracy_rate,
        completion_rate,
        JSON.stringify(categoryScoreMap),
        JSON.stringify(performance_over_time),
        totalScore,
        totalMaxScore
      ]);
    } else {
      // ✅ UPDATE if student exists
      const updateQuery = `
        UPDATE user_analysis SET
          student_name = $2,
          department_name = $3,
          year = $4,
          accuracy_rate = $5,
          completion_rate = $6,
          category = $7,
          performance_over_time = $8,
          total_score = $9,
          max_score = $10,
          updated_at = NOW()
        WHERE student_id = $1
      `;
      await query(updateQuery, [
        student_id,
        student.name,
        student.department,
        student.year,
        accuracy_rate,
        completion_rate,
        JSON.stringify(categoryScoreMap),
        JSON.stringify(performance_over_time),
        totalScore,
        totalMaxScore
      ]);
    }

    console.log(`✅ Analysis ${existingUser.rows.length === 0 ? 'inserted' : 'updated'} for student_id: ${student_id}`);
  } catch (err) {
    console.error(`❌ Error in user_analysis:`, err);
  }
}

module.exports = { user_analysis };
