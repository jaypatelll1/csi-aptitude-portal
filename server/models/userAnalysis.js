const { dbWrite } = require('../config/db');
const { getResultById, getAllResults } = require('../models/resultModel');
const { getUserById } = require('../models/userModel');
const { getExamById } = require('../models/examModel');

async function user_analysis(exam_id, student_id, result) {
  try {
    const student = await getUserById(student_id);
    if (!student) throw new Error(`Student not found`);

    if (!result) {
      console.log(`No result found for student ${student_id} and exam ${exam_id}`);
      return;
    }

    const existingUser = await dbWrite("user_analysis")
      .where({ student_id })
      .first();

    let performance_over_time = [];
    let categoryScoreMap = {};
    let totalScore = 0;
    let totalMaxScore = 0;

    // If student exists
    if (existingUser) {
      performance_over_time = existingUser.performance_over_time || [];
      categoryScoreMap = existingUser.category || {};
      totalScore = existingUser.total_score || 0;
      totalMaxScore = existingUser.max_score || 0;
    }

    // Get exam
    const exam = await getExamById(exam_id);

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

    for (const category in newCatScores) {
      const cs = newCatScores[category];

      if (!categoryScoreMap[category]) {
        categoryScoreMap[category] = { score: 0, max_score: 0 };
      }

      categoryScoreMap[category].score += parseInt(cs.score);
      categoryScoreMap[category].max_score += parseInt(cs.max_score);
    }

    const accuracy_rate = totalMaxScore > 0 ? totalScore / totalMaxScore : 0;

    // Total assigned exams
    const totalAssignedRes = await dbWrite("exams")
      .where("exam_for", "Student")
      .whereRaw("? = ANY(target_branches)", [student.department])
      .whereRaw("? = ANY(target_years)", [student.year])
      .count("* as count")
      .first();

    const totalAssigned = parseInt(totalAssignedRes.count) || 0;

    // Attempted exams
    const attemptedResults = await getAllResults(student_id);
    const attempted = attemptedResults?.length || 0;

    const completion_rate = totalAssigned > 0 ? attempted / totalAssigned : 0;

    if (!existingUser) {
      // INSERT
      await dbWrite("user_analysis").insert({
        student_id: student_id,
        student_name: student.name,
        department_name: student.department,
        year: student.year,
        accuracy_rate,
        completion_rate,
        category: JSON.stringify(categoryScoreMap),
        performance_over_time: JSON.stringify(performance_over_time),
        total_score: totalScore,
        max_score: totalMaxScore,
        updated_at: dbWrite.fn.now()
      });

    } else {
      // UPDATE
      await dbWrite("user_analysis")
        .where({ student_id })
        .update({
          student_name: student.name,
          department_name: student.department,
          year: student.year,
          accuracy_rate,
          completion_rate,
          category: JSON.stringify(categoryScoreMap),
          performance_over_time: JSON.stringify(performance_over_time),
          total_score: totalScore,
          max_score: totalMaxScore,
          updated_at: dbWrite.fn.now()
        });
    }

    console.log(`✅ Analysis ${existingUser ? 'updated' : 'inserted'} for student_id: ${student_id}`);

  } catch (err) {
    console.error(`❌ Error in user_analysis:`, err);
  }
}

module.exports = { user_analysis };
