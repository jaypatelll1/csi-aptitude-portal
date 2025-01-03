const path = require("path");
const {parseExcelQuestion, parseCSVquestion}= require("../models/QuestionFileModel");
const fs = require("fs")



const uploadQuestionFile = async (req, res) => {
    const filePath = path.resolve("uploads", req.file.filename);
    console.log("file path is", filePath);
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const examId = req.params.exam_id;
  
    try {
      let jsonData;
  
      if (fileExtension === ".xlsx" || fileExtension === ".xls") {
        // Parse Excel file
        jsonData = await parseExcelQuestion(filePath, examId); // Ensure parseExcelQuestion is async
        return res.json({
          message: "Excel file uploaded and parsed successfully",
          content: jsonData,
        });
      } else if (fileExtension === ".csv") {
        // Parse CSV file
        jsonData = await parseCSVquestion(filePath, examId); // Ensure parseCSVquestion is async
        return res.json({
          message: "CSV file uploaded and parsed successfully",
          content: jsonData,
        });
      } else {
        return res.status(400).send("Invalid file format. Only Excel and CSV files are supported.");
      }
    } catch (err) {
      console.error("Error processing file:", err);
      return res.status(500).send("Error processing file.");
    } finally {
      // Delete file after processing
      setTimeout(() => {
        try {
          console.log("Deleting file:", filePath);
          fs.unlinkSync(filePath);
          console.log("File deleted successfully:", filePath);
        } catch (err) {
          console.error("Error deleting file:", err);
        }
      }, 5000);
    }
  };
  
  module.exports = {
    uploadQuestionFile,
  };
  