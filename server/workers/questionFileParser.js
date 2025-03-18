const { parentPort, workerData } = require("worker_threads");
const ExcelJS = require("exceljs");
const fs = require("fs");
const csvParser = require("csv-parser");
const { query } = require("../config/db");

if (!workerData || !workerData.filePath || !workerData.fileExtension || !workerData.examId) {
    parentPort.postMessage({ status: "error", message: "Invalid worker data provided" });
    return;
}

const validCategories = ["quantitative aptitude", "logical reasoning", "verbal ability", "technical", "general knowledge"];
const validQuestionTypes = ["single_choice", "multiple_choice", "text", "image"];

const parseExcelQuestion = async (filePath, examId) => {
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.worksheets[0];
        const warnings = [];

        const jsonData = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header row
            const rowData = {
                question_text: row.getCell(1).value,
                question_type: row.getCell(2).value,
                options_a: row.getCell(3).value,
                options_b: row.getCell(4).value,
                options_c: row.getCell(5).value,
                options_d: row.getCell(6).value,
                correct_option: row.getCell(7).value,
                correct_options: row.getCell(8).value,
                image_url: row.getCell(9).value,
                category: row.getCell(10).value
            };
            jsonData.push(rowData);
            console.log(jsonData);
        });

        for (let index = 0; index < jsonData.length; index++) {
            const row = jsonData[index];

            let { question_text, question_type, options_a, options_b, options_c, options_d, correct_option, correct_options, image_url, category } = row;

            if (!question_text || !question_type || !category) {
                warnings.push(`Row ${index + 1}: Skipped due to missing fields.`);
                continue;
            }
            if (image_url === "NULL") image_url = null;

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
                optionsObject = { a: options_a || "", b: options_b || "", c: options_c || "", d: options_d || "" };
                if (!correct_option) {
                    warnings.push(`Row ${index + 1}: Missing correct_option for single_choice.`);
                    continue;
                }
                correctAnswer = correct_option;
            } else if (question_type === "multiple_choice") {
                optionsObject = { a: options_a || "", b: options_b || "", c: options_c || "", d: options_d || "" };
                try {
                    correctAnswers = JSON.parse(correct_options);
                } catch (e) {
                    warnings.push(`Row ${index + 1}: Invalid JSON format in correct_options.`);
                    continue;
                }
            }

            const queryText = `
                INSERT INTO questions (exam_id, question_text, question_type, options, correct_option, correct_options, image_url, category)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
            `;
            const values = [examId, question_text, question_type, optionsObject ? JSON.stringify(optionsObject) : null, correctAnswer, correctAnswers ? JSON.stringify(correctAnswers) : null, image_url || null, categoryType];

            await query(queryText, values);
        }

        console.log("All Excel data inserted successfully.");
        return { status: "success", message: "Excel file processed successfully", warnings };
    } catch (err) {
        console.error("Error inserting Excel data:", err);
        throw new Error(err.detail || "Error inserting data into the database");
    }
};

async function main() {
    try {
        console.log("Starting question file processing...", workerData);

        let result;
        if (workerData.fileExtension === ".xlsx") {
            result = await parseExcelQuestion(workerData.filePath, workerData.examId);
        } else if (workerData.fileExtension === ".csv") {
            result = await parseCSVQuestions(workerData.filePath, workerData.examId);
        } else {
            throw new Error("Invalid file format. Only Excel and CSV are supported.");
        }
        console.log("Processing complete, sending result:", result);
        parentPort.postMessage(result);

        setTimeout(() => {
            try {
                fs.unlinkSync(workerData.filePath);
                console.log("File deleted successfully:", workerData.filePath);
            } catch (err) {
                console.error("Error deleting file:", err);
            }
        }, 5000);
    } catch (error) {
        console.error("Worker main error:", error);
        parentPort.postMessage({ status: "error", message: error.message || "Unknown error in worker" });
    }
}

main().catch((error) => {
    console.error("Unhandled worker error:", error);
    parentPort.postMessage({ status: "error", message: "Unhandled worker error" });
});
