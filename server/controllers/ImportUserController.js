const path = require("path");
const {parseExcelUsers,parseCSVusers,}= require("../models/UserFileModels");
const fs = require("fs");





const uploadFile = (req, res) => {
    const filePath = path.resolve('uploads', req.file.filename);
    console.log('file path is ',filePath);
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    if (fileExtension === ".xlsx" || fileExtension === ".xls") {
        // Parse Excel file
        const jsonData = parseExcelUsers(filePath,res);
        res.json({
            message: "Excel file uploaded and parsed successfully",
            content: jsonData,
        });
    } else if (fileExtension === ".csv") {
        // Parse CSV file
      parseCSVusers(filePath,res)
            .then((jsonData) => {
                res.json({
                    message: "CSV file uploaded and parsed successfully",
                    content: jsonData,
                });
            }) .catch((err) => {
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

  uploadFile
}