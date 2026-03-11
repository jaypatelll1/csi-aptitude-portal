const { dbWrite } = require('../config/db');
const { paginate } = require('../utils/pagination');

// UPDATE teacher result
async function updateResultForTeachers(
  teacher_id,
  exam_id,
  question_id,
  marks_allotted,
  max_score,
  comments
) {
  try {
    const [result] = await dbWrite("teacher_results")
      .where({ exam_id, teacher_id, question_id })
      .update({
        marks_allotted,
        max_score,
        comments,
        completed_at: new Date()
      })
      .returning("*");

    return result;
  } catch (err) {
    console.error("Error updating teacher result:", err);
    throw err;
  }
}

// FETCH all teacher results
async function getAllTeacherResults() {
  try {
    return await dbWrite("teacher_results").select("*");
  } catch (err) {
    console.error("Error fetching teacher results:", err);
  }
}

// FETCH results by teacher
async function getResultsByTeacher(teacher_id) {
  try {
    return await dbWrite("teacher_results as tr")
      .select(
        "tr.teacher_id",
        "tr.exam_id"
      )
      .sum("tr.marks_allotted as total_marks_allotted")
      .sum("tr.max_score as total_max_score")
      .count("tr.question_id as total_questions_graded")
      .max("tr.completed_at as last_evaluation_time")
      .where("tr.teacher_id", teacher_id)
      .groupBy("tr.teacher_id", "tr.exam_id")
      .orderBy("last_evaluation_time", "desc");
  } catch (err) {
    console.error("Error fetching results by teacher:", err);
  }
}

// FETCH teacher result by exam + teacher
async function getTeacherResultById(exam_id, teacher_id) {
  try {
    return await dbWrite("teacher_results")
      .where({ exam_id, teacher_id });
  } catch (err) {
    console.error("Error fetching teacher result:", err);
  }
}

// UPDATE teacher result
async function updateTeacherResult(
  exam_id,
  question_id,
  teacher_id,
  marks_allotted,
  max_score,
  comments
) {
  try {
    const [result] = await dbWrite("teacher_results")
      .where({ teacher_id, exam_id, question_id })
      .update({
        marks_allotted,
        max_score,
        comments
      })
      .returning("*");

    return result;
  } catch (err) {
    console.error("Error updating teacher result:", err);
  }
}

// DELETE teacher result
async function deleteTeacherResult(teacher_id, exam_id, question_id) {
  try {
    const [deleted] = await dbWrite("teacher_results")
      .where({ teacher_id, exam_id, question_id })
      .del()
      .returning("*");

    return deleted;
  } catch (err) {
    console.error("Error deleting teacher result:", err);
  }
}

// PAGINATED results by exam
async function getPaginatedTeacherResultsByExam(exam_id, page, limit) {
  try {
    const query = dbWrite("teacher_results as tr")
      .select("tr.teacher_id", "tr.exam_id")
      .sum("tr.marks_allotted as total_marks_allotted")
      .sum("tr.max_score as total_max_score")
      .count("tr.question_id as total_questions_graded")
      .max("tr.completed_at as last_evaluation_time")
      .where("tr.exam_id", exam_id)
      .groupBy("tr.teacher_id", "tr.exam_id")
      .orderBy("last_evaluation_time", "desc");

    const paginatedQuery = paginate(query, page, limit);

    return await paginatedQuery;
  } catch (err) {
    console.error("Error fetching paginated teacher results:", err);
    return [];
  }
}

// PAST results
async function pastTeacherResult(exam_id) {
  try {
    return await dbWrite("teacher_results")
      .where({ exam_id })
      .orderBy("completed_at", "desc");
  } catch (err) {
    console.error("Error fetching past teacher results:", err);
  }
}

// COMPLEX correctness query (kept raw)
async function getCorrectIncorrectForTeacher(teacher_id, exam_id) {
  try {
    const { rows } = await dbWrite.raw(
      `
      SELECT 
        tr.teacher_id,
        q.question_id,
        q.question_text,
        q.options,
        q.category,
        q.question_type,

        CASE 
          WHEN q.question_type = 'multiple_choice' THEN tr.selected_options
          WHEN q.question_type = 'text' THEN to_jsonb(tr.text_answer)
          ELSE to_jsonb(tr.selected_option)
        END AS selected_response,

        CASE 
          WHEN q.question_type = 'text' THEN NULL
          WHEN q.question_type = 'multiple_choice' THEN q.correct_options
          ELSE to_jsonb(q.correct_option)
        END AS correct_answer,

        CASE 
          WHEN q.question_type = 'text' THEN NULL
          WHEN q.question_type = 'multiple_choice'
            THEN (tr.selected_options @> q.correct_options AND q.correct_options @> tr.selected_options)::text
          ELSE (tr.selected_option = q.correct_option)::text
        END AS result_status

      FROM teacher_responses tr
      JOIN questions q ON tr.question_id = q.question_id
      WHERE tr.teacher_id = ?
      AND tr.exam_id = ?
      `,
      [teacher_id, exam_id]
    );

    return rows;
  } catch (err) {
    console.error("Error fetching correct/incorrect teacher results:", err);
  }
}

// INITIALIZE teacher result
async function initializeResultForTeachers(teacher_id, exam_id) {
  try {
    const questions = await dbWrite("questions")
      .select("question_id")
      .where({ exam_id });

    if (questions.length === 0) {
      console.log("No questions found for this exam.");
      return;
    }

    const rows = questions.map(q => ({
      exam_id,
      question_id: q.question_id,
      teacher_id
    }));

    await dbWrite("teacher_results")
      .insert(rows)
      .onConflict(["exam_id", "question_id", "teacher_id"])
      .ignore();

  } catch (err) {
    console.error("Error initializing teacher results:", err);
  }
}

module.exports = {
  updateResultForTeachers,
  getAllTeacherResults,
  getResultsByTeacher,
  getTeacherResultById,
  updateTeacherResult,
  deleteTeacherResult,
  getPaginatedTeacherResultsByExam,
  pastTeacherResult,
  getCorrectIncorrectForTeacher,
  initializeResultForTeachers
};
