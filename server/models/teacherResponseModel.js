const { dbWrite } = require("../config/db");
const { paginate } = require("../utils/pagination");

// DELETE existing responses
const deleteExistingResponses = async (exam_id, teacher_id) => {
  if (!exam_id || !teacher_id) {
    throw new Error("Both exam_id and teacher_id are required.");
  }

  const deleted = await dbWrite("teacher_responses")
    .where({ exam_id, teacher_id })
    .del();

  return { success: true, deletedRows: deleted };
};

// BULK INSERT responses
const submitMultipleResponses = async (responses) => {
  const result = await dbWrite("teacher_responses")
    .insert(responses)
    .returning("*");

  return result;
};

// INSERT unanswered questions
const submittedUnansweredQuestions = async (exam_id, teacher_id) => {
  const questions = await dbWrite("questions as q")
    .select("q.question_id", "q.question_type")
    .where("q.exam_id", exam_id)
    .whereNotExists(function () {
      this.select("*")
        .from("teacher_responses as tr")
        .whereRaw("tr.question_id = q.question_id")
        .where("tr.exam_id", exam_id)
        .where("tr.teacher_id", teacher_id);
    });

  const unanswered = questions.map((q) => ({
    exam_id,
    question_id: q.question_id,
    teacher_id,
    selected_option: null,
    selected_options: null,
    text_answer: null,
    question_type: q.question_type,
  }));

  if (unanswered.length > 0) {
    return submitMultipleResponses(unanswered);
  }

  return [];
};

// UPDATE teacher response
const submitTeacherResponse = async (
  teacher_id,
  exam_id,
  question_id,
  selected_option,
  selected_options,
  text_answer,
  question_type,
  response_status
) => {
  let updateData = { response_status };

  if (question_type === "single_choice") {
    updateData.selected_option = selected_option;
    updateData.selected_options = null;
    updateData.text_answer = null;
  }

  if (question_type === "multiple_choice") {
    updateData.selected_option = null;
    updateData.selected_options = JSON.stringify(selected_options);
    updateData.text_answer = null;
  }

  if (question_type === "text") {
    updateData.selected_option = null;
    updateData.selected_options = null;
    updateData.text_answer = text_answer;
  }

  const [result] = await dbWrite("teacher_responses")
    .where({
      exam_id,
      question_id,
      teacher_id,
      question_type,
    })
    .update(updateData)
    .returning("*");

  return result;
};

// FINAL SUBMIT
const submitFinalTeacherResponsesAndChangeStatus = async (
  teacher_id,
  exam_id
) => {
  return await dbWrite("teacher_responses")
    .where({ exam_id, teacher_id })
    .update({
      response_status: "submitted",
      answered_at: dbWrite.fn.now(),
    })
    .returning("*");
};

// GET exam IDs by response status
const getExamIdByResponse = async (status, user_id) => {
  const rows = await dbWrite("teacher_responses")
    .distinct("exam_id")
    .where({
      teacher_id: user_id,
      response_status: status,
    });

  return rows.map((r) => r.exam_id);
};

// GET attempted teachers
const getAttemptedTest = async (exam_id) => {
  return await dbWrite("teacher_responses as t")
    .join("users as u", "t.teacher_id", "u.user_id")
    .distinct(
      "t.teacher_id",
      "t.exam_id",
      "t.response_status",
      "u.name",
      "u.email"
    )
    .where("t.exam_id", exam_id);
};

// CLEAR response
const clearResponse = async (teacherId, examId, questionId) => {
  return await dbWrite("teacher_responses")
    .where({
      teacher_id: teacherId,
      exam_id: examId,
      question_id: questionId,
      response_status: "draft",
    })
    .update({
      selected_option: null,
      selected_options: null,
      text_answer: null,
    })
    .returning("*");
};

// PAGINATED responses
const getPaginatedResponses = async (teacher_id, exam_id, page, limit) => {
  let query = dbWrite("teacher_responses as tr")
    .join("questions as q", "tr.question_id", "q.question_id")
    .select(
      "tr.response_id",
      "tr.selected_option",
      "tr.selected_options",
      "tr.text_answer",
      "q.question_type",
      "tr.answered_at",
      "tr.question_id",
      "q.question_text",
      "q.options",
      "q.image_url"
    )
    .where({
      "q.exam_id": exam_id,
      "tr.teacher_id": teacher_id,
    })
    .orderBy("tr.response_id");

  if (page && limit) {
    query = paginate(query, page, limit);
  }

  return await query;
};

// PAGINATED teachers who attempted exam
const getAttemptedTeachersForExam = async (exam_id, page, limit) => {
  let query = dbWrite("teacher_responses as tr")
    .join("users as u", "tr.teacher_id", "u.user_id")
    .distinct("u.user_id as teacher_id", "u.name", "u.email", "u.phone")
    .where("tr.exam_id", exam_id);

  if (page && limit) {
    query = paginate(query, page, limit);
  }

  return await query;
};

module.exports = {
  deleteExistingResponses,
  submittedUnansweredQuestions,
  submitTeacherResponse,
  submitFinalTeacherResponsesAndChangeStatus,
  getExamIdByResponse,
  clearResponse,
  getPaginatedResponses,
  getAttemptedTeachersForExam,
  getAttemptedTest,
};
