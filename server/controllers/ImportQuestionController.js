const path = require("path");
const {parseExcelQuestion, parseCSVquestion}= require("../models/QuestionFileModel");
const fs = require("fs")



const uploadQuestionFile = (req, res) => {
  const filePath = path.resolve('uploads', req.file.filename);
      console.log('file path is ',filePath);
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
  
console.log('req.params is ',req.params.exam_id);
const examId = req.params.exam_id ;

    if (fileExtension === ".xlsx" || fileExtension === ".xls") {
        // Parse Excel file
        const jsonData = parseExcelQuestion(filePath,examId,req);
        res.json({
            message: "Excel file uploaded and parsed successfully",
            content: jsonData,
        });
    } else if (fileExtension === ".csv") {
        // Parse CSV file
        parseCSVquestion(filePath,examId)
            .then((jsonData) => {
                res.json({
                    message: "CSV file uploaded and parsed successfully",
                    content: jsonData,
                });
            })
            .catch((err) => {

                console.error("Error parsing CSV file:", err);
                res.status(500).send("Error parsing CSV file");
            });
    } else {
        res.status(400).send("Invalid file format. Only Excel and CSV files are supported.");
    }

    setTimeout(() => {
            try {
                console.log('Deleting file:', filePath);
                fs.unlinkSync(filePath);
                console.log('File deleted successfully:', filePath);
            } catch (err) {
                console.error('Error deleting file:', err);
            }
        }, 5000);
};


module.exports ={
  
  uploadQuestionFile
}