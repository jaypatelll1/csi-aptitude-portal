const fs = require("fs");
const XLSX = require("xlsx");
const csvParser = require("csv-parser");
const { query } = require("../config/db");

const validCategories = [
  "quantitative aptitude",
  "logical reasoning",
  "verbal ability",
  "technical",
  "general knowledge",
];

const validQuestionTypes = ["single_choice", "multiple_choice", "text", "image"];

/**
 * Parses and inserts Excel questions into the database.
 */
const parseExcelQuestion = async (filePath, examId) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
    const warnings = [];

    for (let index = 0; index < jsonData.length; index++) {
      const row = jsonData[index];
      // console.log(jsonData)
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
        category,
      } = row;

      if (!question_text || !question_type || !category) {
        warnings.push(`Row ${index + 1}: Skipped due to missing fields.`);
        continue;
      }
      if(image_url === "NULL") image_url=null;
      const categoryType = category.toLowerCase();
      if (!validCategories.includes(categoryType)) {
        warnings.push(`Row ${index + 1}: Invalid category - ${category}`);
        continue;
      }

      if (!validQuestionTypes.includes(question_type)) {
        warnings.push(`Row ${index + 1}: Invalid question type - ${question_type}`);
        continue;
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
          warnings.push(`Row ${index + 1}: Missing correct_option for single_choice.`);
          continue;
        }
        correctAnswer = correct_option;
      } else if (question_type === "multiple_choice") {
        optionsObject = {
          a: options_a || "",
          b: options_b || "",
          c: options_c || "",
          d: options_d || "",
        };
        if (!correct_options) {
          warnings.push(`Row ${index + 1}: Missing correct_options for multiple_choice.`);
          continue;
        }
        correctAnswers = JSON.parse(correct_options);
      } else if (question_type === "text") {
        optionsObject = null; // No options for text-based questions
      } else if (question_type === "image") {
        if (!image_url) {
          warnings.push(`Row ${index + 1}: Missing image_url for image question.`);
          continue;
        }
      }

      const queryText = `
        INSERT INTO questions (exam_id, question_text, question_type, options, correct_option, correct_options, image_url, category)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `;
      const values = [
        examId,
        question_text,
        question_type,
        optionsObject ? JSON.stringify(optionsObject) : null,
        correctAnswer,
        correctAnswers ? JSON.stringify(correctAnswers) : null,
        image_url || null,
        categoryType
      ];

      await query(queryText, values);
    }

    console.log("All Excel data inserted successfully.");
    console.log("warnings: ", warnings);
    return jsonData;
  } catch (err) {
    console.error("Error inserting Excel data:", err);
    throw new Error(err.detail || "Error inserting data into the database");
  }
};

/**
 * Parses and inserts CSV questions into the database.
 */
const parseCSVQuestion = async (filePath, examId) => {
  try {
    const jsonData = await new Promise((resolve, reject) => {
      const data = [];
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => data.push(row))
        .on("end", () => resolve(data))
        .on("error", (err) => reject(err));
    });

    const warnings = [];

    for (let index = 0; index < jsonData.length; index++) {
      const row = jsonData[index];
      const {
        question_text,
        question_type,
        options,
        correct_option,
        correct_options,
        image_url,
        category,
      } = row;

      if (!question_text || !question_type || !category) {
        warnings.push(`Row ${index + 1}: Skipped due to missing fields.`);
        continue;
      }

      const categoryType = category.toLowerCase();
      if (!validCategories.includes(categoryType)) {
        warnings.push(`Row ${index + 1}: Invalid category - ${category}`);
        continue;
      }

      if (!validQuestionTypes.includes(question_type)) {
        warnings.push(`Row ${index + 1}: Invalid question type - ${question_type}`);
        continue;
      }

      let optionsObject = null;
      let correctAnswer = null;
      let correctAnswers = null;

      if (question_type === "single_choice") {
        try {
          optionsObject = JSON.parse(options);
        } catch (err) {
          warnings.push(`Row ${index + 1}: Invalid options format.`);
          continue;
        }
        if (!correct_option) {
          warnings.push(`Row ${index + 1}: Missing correct_option for single_choice.`);
          continue;
        }
        correctAnswer = correct_option;
      } else if (question_type === "multiple_choice") {
        try {
          optionsObject = JSON.parse(options);
          correctAnswers = JSON.parse(correct_options);
        } catch (err) {
          warnings.push(`Row ${index + 1}: Invalid JSON format in options or correct_options.`);
          continue;
        }
      } else if (question_type === "text") {
        optionsObject = null;
      } else if (question_type === "image") {
        if (!image_url) {
          warnings.push(`Row ${index + 1}: Missing image_url for image question.`);
          continue;
        }
      }

      const queryText = `
        INSERT INTO questions (exam_id, question_text, question_type, options, correct_option, correct_options, image_url, category)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `;
      const values = [
        examId,
        question_text,
        question_type,
        optionsObject ? JSON.stringify(optionsObject) : null,
        correctAnswer,
        correctAnswers ? JSON.stringify(correctAnswers) : null,
        image_url || null,
        categoryType
      ];

      await query(queryText, values);
    }

    console.log("All CSV data inserted successfully.");
    return warnings;
  } catch (err) {
    console.error("Error inserting CSV data:", err);
    throw new Error(err.detail || "Error inserting data into the database");
  }
};

module.exports = {
  parseExcelQuestion,
  parseCSVQuestion,
};
