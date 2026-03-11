const { dbWrite } = require("../config/db");

/*
CREATE QUESTIONS TABLE
*/
const createQuestionsTable = async () => {
  const exists = await dbWrite.schema.hasTable("questions");

  if (!exists) {
    await dbWrite.schema.createTable("questions", (table) => {
      table.increments("question_id").primary();
      table.string("exam_id").notNullable();
      table.text("question_text").notNullable();
      table.jsonb("options");
      table.string("correct_option");
      table.jsonb("correct_options");
      table.string("category");
      table.string("question_type");
      table.string("image_url");

      table
        .foreign("exam_id")
        .references("exam_id")
        .inTable("exams")
        .onDelete("CASCADE");
    });
  }
};

/*
INSERT QUESTION
*/
const insertQuestion = async (
  exam_id,
  question_type,
  question_text,
  options,
  correct_option,
  correct_options,
  category_type,
  image_url
) => {
  try {
    const [question] = await dbWrite("questions")
      .insert({
        exam_id,
        question_type,
        question_text,
        options,
        correct_option,
        correct_options,
        category: category_type,
        image_url,
      })
      .returning("*");

    return question;
  } catch (err) {
    console.error("Error inserting question:", err);
    throw err;
  }
};

/*
GET QUESTIONS BY EXAM
*/
const getQuestionsByExamId = async (exam_id) => {
  try {
    return await dbWrite("questions").where({ exam_id });
  } catch (err) {
    console.error("Error fetching questions:", err);
    throw err;
  }
};

/*
GET STUDENT QUESTIONS (HIDE ANSWERS)
*/
const getStudentQuestionsByExamId = async (exam_id) => {
  try {
    return await dbWrite("questions")
      .select(
        "question_id",
        "exam_id",
        "question_text",
        "options",
        "category",
        "question_type",
        "image_url"
      )
      .where({ exam_id });
  } catch (err) {
    console.error("Error fetching student questions:", err);
    throw err;
  }
};

/*
UPDATE QUESTION
*/
const updateQuestions = async (
  question_id,
  exam_id,
  question_type,
  question_text,
  options,
  correct_option,
  correct_options,
  category_type,
  image_url
) => {
  try {
    const [updated] = await dbWrite("questions")
      .where({ question_id })
      .update({
        exam_id,
        question_type,
        question_text,
        options,
        correct_option,
        correct_options,
        category: category_type,
        image_url,
      })
      .returning("*");

    return updated;
  } catch (err) {
    console.error("Error updating question:", err);
    throw err;
  }
};

/*
DELETE QUESTION
*/
const deleteQuestions = async (question_id) => {
  try {
    const [deleted] = await dbWrite("questions")
      .where({ question_id })
      .del()
      .returning("*");

    return deleted;
  } catch (err) {
    console.error("Error deleting question:", err);
    throw err;
  }
};

/*
PAGINATED QUESTIONS
*/
const getPaginatedQuestionsByExam = async (exam_id, page, limit) => {
  try {
    let query = dbWrite("questions").where({ exam_id });

    if (page && limit) {
      const offset = (page - 1) * limit;
      query = query.limit(limit).offset(offset);
    }

    return await query;
  } catch (err) {
    console.error("Error fetching paginated questions:", err);
    throw err;
  }
};

/*
GET QUESTION BY ID
*/
const getQuestionById = async (question_id) => {
  try {
    const question = await dbWrite("questions")
      .where({ question_id })
      .first();

    return question || null;
  } catch (err) {
    console.error("Error fetching question:", err);
    throw err;
  }
};

/*
UPDATE QUESTION IMAGE
*/
const updateQuestionImage = async (question_id, image_url) => {
  try {
    const [updated] = await dbWrite("questions")
      .where({ question_id })
      .update({ image_url })
      .returning("*");

    return updated;
  } catch (err) {
    console.error("Error updating image:", err);
    throw err;
  }
};

module.exports = {
  createQuestionsTable,
  insertQuestion,
  getQuestionsByExamId,
  updateQuestions,
  deleteQuestions,
  getPaginatedQuestionsByExam,
  getStudentQuestionsByExamId,
  getQuestionById,
  updateQuestionImage,
};
