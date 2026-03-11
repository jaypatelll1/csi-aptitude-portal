const { dbWrite } = require("../config/db");
const { paginate } = require("../utils/pagination");

/*
DELETE EXISTING RESPONSES
*/
const deleteExistingResponses = async (exam_id, user_id) => {
  if (!exam_id || !user_id) {
    throw new Error("Both exam_id and user_id are required.");
  }

  try {
    const deletedRows = await dbWrite("responses")
      .where({ exam_id, student_id: user_id })
      .del();

    return { success: true, deletedRows };
  } catch (error) {
    console.error("Error deleting responses:", error);
    throw error;
  }
};

/*
SUBMIT SINGLE RESPONSE
*/
const submitResponse = async (
  student_id,
  exam_id,
  question_id,
  selected_option,
  selected_options,
  text_answer,
  question_type,
  response_status
) => {
  try {
    let updateData = {
      status: response_status,
    };

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

    const [result] = await dbWrite("responses")
      .where({
        exam_id,
        question_id,
        student_id,
        question_type,
      })
      .update(updateData)
      .returning("*");

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/*
BULK INSERT RESPONSES
*/
const submitMultipleResponses = async (responses) => {
  try {
    const result = await dbWrite("responses").insert(responses).returning("*");
    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/*
INSERT NULL RESPONSES WHEN EXAM STARTS
*/
const submittedUnansweredQuestions = async (exam_id, student_id) => {
  const questions = await dbWrite("questions")
    .select("question_id", "question_type")
    .where("exam_id", exam_id)
    .whereNotIn("question_id", function () {
      this.select("question_id")
        .from("responses")
        .where({ exam_id, student_id });
    });

  const unanswered = questions.map((q) => ({
    exam_id,
    question_id: q.question_id,
    student_id,
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

/*
FINAL SUBMIT
*/
const submitFinalResponsesAndChangeStatus = async (
  student_id,
  exam_id,
  responses
) => {
  try {
    for (const response of responses) {
      const {
        question_id,
        selected_option,
        selected_options,
        text_answer,
        question_type,
      } = response;

      await dbWrite("responses")
        .where({ exam_id, student_id, question_id })
        .update({
          selected_option,
          selected_options,
          text_answer,
          question_type,
          status: "submitted",
          answered_at: dbWrite.fn.now(),
        });
    }

    return { success: true, message: "Responses updated successfully" };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/*
GET RESPONSES BY STUDENT
*/
const getResponsesByStudent = async (exam_id, student_id) => {
  return await dbWrite("responses")
    .select(
      "response_id",
      "selected_option",
      "answered_at",
      "responses.question_id"
    )
    .join("questions", "questions.question_id", "responses.question_id")
    .where({
      "responses.exam_id": exam_id,
      student_id,
    });
};

/*
GET ALL RESPONSES FOR EXAM
*/
const getResponsesForExam = async (exam_id) => {
  return await dbWrite("responses")
    .select(
      "response_id",
      "selected_option",
      "answered_at",
      "student_id",
      "responses.question_id"
    )
    .join("questions", "questions.question_id", "responses.question_id")
    .join("users", "users.user_id", "responses.student_id")
    .where("responses.exam_id", exam_id);
};

/*
UPDATE RESPONSE
*/
const updateResponse = async (response_id, selected_option) => {
  const [result] = await dbWrite("responses")
    .where({ response_id })
    .update({
      selected_option,
      answered_at: dbWrite.fn.now(),
    })
    .returning(["response_id", "selected_option", "answered_at"]);

  return result;
};

/*
GET EXAM IDS BY STATUS
*/
const getExamIdByResponse = async (status, user_id) => {
  const rows = await dbWrite("responses")
    .distinct("exam_id")
    .where({
      student_id: user_id,
      status,
    });

  return rows.map((r) => r.exam_id);
};

/*
DELETE RESPONSE
*/
const deleteResponse = async (response_id) => {
  const deleted = await dbWrite("responses")
    .where({ response_id })
    .del();

  return deleted > 0;
};

/*
PAGINATED RESPONSES
*/
const getPaginatedResponses = async (exam_id, student_id, page, limit) => {
  let query = dbWrite("responses as r")
    .select(
      "response_id",
      "selected_option",
      "selected_options",
      "text_answer",
      "q.question_type",
      "answered_at",
      "r.question_id",
      "q.question_text",
      "q.options",
      "q.image_url"
    )
    .join("questions as q", "r.question_id", "q.question_id")
    .where({
      "q.exam_id": exam_id,
      "r.student_id": student_id,
    })
    .orderBy("response_id");

  if (page && limit) {
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);
  }

  return await query;
};

/*
CLEAR RESPONSE
*/
const clearResponse = async (studentId, examId, questionId) => {
  const result = await dbWrite("responses")
    .where({
      student_id: studentId,
      exam_id: examId,
      question_id: questionId,
      status: "draft",
    })
    .update({
      selected_option: null,
      selected_options: null,
      text_answer: null,
    })
    .returning("*");

  return result;
};

module.exports = {
  submitResponse,
  getResponsesByStudent,
  getResponsesForExam,
  updateResponse,
  deleteResponse,
  submitMultipleResponses,
  getPaginatedResponses,
  submittedUnansweredQuestions,
  submitFinalResponsesAndChangeStatus,
  deleteExistingResponses,
  getExamIdByResponse,
  clearResponse,
};
