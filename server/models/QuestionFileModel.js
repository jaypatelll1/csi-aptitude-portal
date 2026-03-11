const fs = require("fs");
const XLSX = require("xlsx");
const csvParser = require("csv-parser");
const { dbWrite } = require("../config/db");

const validCategories = [
  "quantitative aptitude",
  "logical reasoning",
  "verbal ability",
  "technical",
  "general knowledge",
];

const validQuestionTypes = ["single_choice", "multiple_choice", "text", "image"];

/*
COMMON PROCESS FUNCTION
*/
function processQuestionRow(row, index, examId, warnings) {

  let {
    question_text,
    question_type,
    options_a,
    options_b,
    options_c,
    options_d,
    correct_option,
    correct_options,
    image_url,
    category
  } = row;

  if (!question_text || !question_type || !category) {
    warnings.push(`Row ${index + 1}: Missing required fields`);
    return null;
  }

  const categoryType = category.toLowerCase();

  if (!validCategories.includes(categoryType)) {
    warnings.push(`Row ${index + 1}: Invalid category - ${category}`);
    return null;
  }

  if (!validQuestionTypes.includes(question_type)) {
    warnings.push(`Row ${index + 1}: Invalid question type - ${question_type}`);
    return null;
  }

  let optionsObject = null;
  let correctAnswer = null;
  let correctAnswers = null;

  if (question_type === "single_choice") {

    optionsObject = {
      a: options_a || "",
      b: options_b || "",
      c: options_c || "",
      d: options_d || "",
    };

    if (!correct_option) {
      warnings.push(`Row ${index + 1}: Missing correct_option`);
      return null;
    }

    correctAnswer = correct_option;
  }

  else if (question_type === "multiple_choice") {

    optionsObject = {
      a: options_a || "",
      b: options_b || "",
      c: options_c || "",
      d: options_d || "",
    };

    if (!correct_options) {
      warnings.push(`Row ${index + 1}: Missing correct_options`);
      return null;
    }

    try {
      correctAnswers = JSON.parse(correct_options);
    } catch {
      warnings.push(`Row ${index + 1}: Invalid correct_options JSON`);
      return null;
    }
  }

  else if (question_type === "text") {
    optionsObject = null;
  }

  else if (question_type === "image") {

    if (!image_url) {
      warnings.push(`Row ${index + 1}: Missing image_url`);
      return null;
    }

  }

  if (image_url === "NULL") image_url = null;

  return {
    exam_id: examId,
    question_text,
    question_type,
    options: optionsObject,
    correct_option: correctAnswer,
    correct_options: correctAnswers,
    image_url: image_url || null,
    category: categoryType
  };
}


/*
PARSE EXCEL FILE
*/
const parseExcelQuestion = async (filePath, examId) => {

  try {

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const warnings = [];
    const questions = [];

    rows.forEach((row, index) => {

      const processed = processQuestionRow(row, index, examId, warnings);

      if (processed) {
        questions.push(processed);
      }

    });

    if (questions.length > 0) {

      // Insert in batches of 100
      await dbWrite.batchInsert("questions", questions, 100);

    }

    console.log(`Inserted ${questions.length} questions from Excel`);
    console.log("Warnings:", warnings);

    return {
      inserted: questions.length,
      warnings
    };

  } catch (err) {

    console.error("Excel upload error:", err);
    throw new Error(err.detail || "Error inserting Excel data");

  }

};


/*
PARSE CSV FILE
*/
const parseCSVQuestion = async (filePath, examId) => {

  try {

    const rows = await new Promise((resolve, reject) => {

      const data = [];

      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => data.push(row))
        .on("end", () => resolve(data))
        .on("error", reject);

    });

    const warnings = [];
    const questions = [];

    rows.forEach((row, index) => {

      const processed = processQuestionRow(row, index, examId, warnings);

      if (processed) {
        questions.push(processed);
      }

    });

    if (questions.length > 0) {

      // Insert in batches of 100
      await dbWrite.batchInsert("questions", questions, 100);

    }

    console.log(`Inserted ${questions.length} questions from CSV`);

    return {
      inserted: questions.length,
      warnings
    };

  } catch (err) {

    console.error("CSV upload error:", err);
    throw new Error(err.detail || "Error inserting CSV data");

  }

};


module.exports = {
  parseExcelQuestion,
  parseCSVQuestion
};
