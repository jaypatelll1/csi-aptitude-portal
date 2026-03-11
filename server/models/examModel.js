const { dbWrite } = require("../config/db");
const { paginate } = require("../utils/pagination");

/*
CREATE EXAM
*/
const createExam = async (exam) => {
  try {

    const {
      name,
      duration,
      created_by,
      formattedTargetYears,
      formattedTargetBranches,
      exam_for
    } = exam;

    const [result] = await dbWrite("exams")
      .insert({
        exam_name: name,
        duration,
        created_by,
        status: "draft",
        target_years: formattedTargetYears,
        target_branches: formattedTargetBranches,
        exam_for
      })
      .returning("*");

    return result;

  } catch (err) {
    console.error(err);
    throw err;
  }
};

/*
GET ALL EXAMS
*/
const getExams = async () => {
  return await dbWrite("exams").select("*");
};

/*
GET EXAM BY ID
*/
const getExamById = async (exam_id) => {
  return await dbWrite("exams")
    .where({ exam_id })
    .first();
};

/*
UPDATE EXAM
*/
const updateExam = async (exam) => {

  const {
    exam_id,
    name,
    duration,
    start_time,
    end_time,
    created_by,
    status
  } = exam;

  const [result] = await dbWrite("exams")
    .where({ exam_id })
    .update({
      exam_name: name,
      duration,
      start_time,
      end_time,
      created_by,
      status
    })
    .returning("*");

  return result;
};

/*
SCHEDULE EXAM
*/
const scheduleExam = async (exam_id, start_time, end_time) => {

  const [result] = await dbWrite("exams")
    .where({ exam_id })
    .update({
      start_time,
      end_time,
      status: "scheduled"
    })
    .returning("*");

  return result;
};

/*
UPDATE STATUS
*/
const markPastExam = async (exam_id) => {

  const [result] = await dbWrite("exams")
    .where({ exam_id })
    .update({ status: "past" })
    .returning("*");

  return result;
};

const markLiveExam = async (exam_id) => {

  const [result] = await dbWrite("exams")
    .where({ exam_id })
    .update({ status: "live" })
    .returning("*");

  return result;
};

/*
DELETE EXAM
*/
const deleteExam = async (exam_id) => {

  // questions will delete automatically if FK has CASCADE
  const [result] = await dbWrite("exams")
    .where({ exam_id })
    .del()
    .returning("*");

  return result;
};

/*
GET PAGINATED EXAMS
*/
const getAllPaginatedExams = async (page, limit) => {

  let query = dbWrite("exams").orderBy("exam_id", "asc");

  if (page && limit) {
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);
  }

  return await query;
};

/*
EXAM COUNT
*/
const ExamCount = async (role) => {

  const exam_for = role === "President" || role === "Teacher"
    ? "Teacher"
    : "Student";

  const result = await dbWrite("exams")
    .select("status")
    .count("* as count")
    .where({ exam_for })
    .groupBy("status");

  const counts = {
    draft: 0,
    scheduled: 0,
    live: 0,
    past: 0
  };

  result.forEach(row => {
    counts[row.status] = Number(row.count);
  });

  return counts;
};

/*
GET SCHEDULED EXAMS
*/
const getAllScheduledExams = async () => {
  return await dbWrite("exams")
    .where({ status: "scheduled" });
};

/*
GET LAST PAST EXAM
*/
const getLastExam = async (exam_for) => {

  return await dbWrite("exams")
    .where({
      exam_for,
      status: "past"
    })
    .orderBy("created_at", "desc")
    .first();
};

/*
GET EXAM STATUS
*/
const getExamStatusById = async (exam_id) => {

  return await dbWrite("exams")
    .select("exam_id", "start_time", "end_time", "status")
    .where({ exam_id })
    .first();
};

/*
GET EXAMS ATTEMPTED BY TEACHER
*/
const getExamsByTeacherId = async (teacher_id) => {

  const result = await dbWrite("exams as e")
    .join("responses as r", "e.exam_id", "r.exam_id")
    .select(
      "e.exam_id",
      "e.exam_name",
      "e.duration"
    )
    .countDistinct("r.question_id as total_attempted_questions")
    .where("r.student_id", teacher_id)
    .groupBy("e.exam_id", "e.exam_name", "e.duration")
    .orderBy("e.exam_name", "desc");

  return result;
};

module.exports = {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  getAllPaginatedExams,
  scheduleExam,
  markLiveExam,
  markPastExam,
  getLastExam,
  ExamCount,
  getExamStatusById,
  getAllScheduledExams,
  getExamsByTeacherId
};
