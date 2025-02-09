const fs = require("fs");
const XLSX = require("xlsx");
const csvParser = require("csv-parser");
const { query } = require("../config/db");

const parseExcelQuestion = async (filePath, examId) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);

    // console.log("Excel Data to insert:", jsonData);
    const warnings = []; // Collect all warnings here
    let index = 0; 
    for (const row of jsonData) {
      // console.log(jsonData)
      const { question_text, correct_option, options_a, options_b, options_c, options_d ,category} = row;

      if (!question_text || (!options_a && !options_b && !options_c && !options_d) || !correct_option || !category) {
        warnings.push(`Row ${index + 1}: Skipped due to invalid data - ${JSON.stringify(row)}`);
        // console.log(warnings)
    index++; // Increment index
    continue;
      }

      // Construct the options object dynamically
      const optionsObject = {
        a: options_a || "",
        b: options_b || "",
        c: options_c || "",
        d: options_d || "",
      };
// Convert category to lowercase and validate it against ENUM values
const category_type = category.toLowerCase();
const validCategories = [
  'quantitative aptitude',
  'logical reasoning',
  'verbal ability',
  'technical',
  'general knowledge',
];


if (!validCategories.includes(category_type)) {
  warnings.push(`Row ${index + 1}: Skipped due to invalid data - ${JSON.stringify(row)}`);
  // console.log(warnings)
index++; // Increment index
continue;
}

      const queryText = `
        INSERT INTO questions (exam_id, question_text, options, correct_option, category)
VALUES ($1, $2, $3, $4, $5);

      `;
      const values = [examId, question_text, JSON.stringify(optionsObject), correct_option,category_type];
      await query(queryText, values);
      
    }

    console.log("All Excel data inserted successfully.");
    return warnings; 
  } catch (err) {
    console.error("Error inserting Excel data:", err);
    throw new Error(err.detail || "Error inserting data into the database");
  }
};

const parseCSVquestion = async (filePath, examId) => {
  try {
    const jsonData = await new Promise((resolve, reject) => {
      const data = [];
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => data.push(row))
        .on("end", () => resolve(data))
        .on("error", (err) => reject(err));
    });

    // console.log("CSV Data to insert:", jsonData);

    for (const row of jsonData) {
      const {  question_text, options, correct_option } = row;

      if (!question_text || !options || !correct_option) {
        console.warn(`Skipping invalid row: ${JSON.stringify(row)}`);
        continue;
      }

      const cleanedOptions = options
        .replace(/"\s*'/g, '"')
        .replace(/'\s*"/g, '"')
        .replace(/\s*'/g, '"')
        .replace(/(\w+)\s*:/g, '"$1":');

      let parsedOptions;
      try {
        parsedOptions = JSON.parse(cleanedOptions);
      } catch (err) {
        console.error("Invalid options format, skipping row:", err);
        continue;
      }

      const queryText = `
        INSERT INTO questions ( exam_id, question_text, options, correct_option)
        VALUES ($1, $2, $3, $4)
      `;
      const values = [ examId, question_text, parsedOptions, correct_option];
      await query(queryText, values);
    }

    console.log("All CSV data inserted successfully.");
  } catch (err) {
    console.error("Error inserting CSV data:", err);
    throw new Error(err.detail || "Error inserting data into the database");
  }
};

module.exports = {
  parseExcelQuestion,
  parseCSVquestion,
};