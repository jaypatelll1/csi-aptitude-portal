const path = require("path");
const { parseExcelUsers, parseCSVusers, } = require("../models/UserFileModels");
const fs = require("fs");





const uploadFile = async (req, res) => {
    const filePath = path.resolve('uploads', req.file.filename);
    console.log('file path is ', filePath);
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    if (fileExtension === ".xlsx" || fileExtension === ".xls") {
        // Parse Excel file
        try {
            // Call the model function to parse and insert data
            const result = await parseExcelUsers(filePath);
            console.log('result', result);


            // Check the result and send appropriate response
            if (result.status === 'success') {
                // If there are warnings, include them in the response
                return res.json({
                    status: 'success',
                    message: result.message,
                    warnings: result.warnings || [] // Send warnings if they exist
                });
            } else {
                // If there's an error, send the error message
                return res.status(500).json({
                    status: 'error',
                    message: result.message
                });
            }
        } catch (err) {
            console.error("Error uploading file:", err);
            return res.status(500).json({
                status: 'error',
                message: "An unexpected error occurred."
            });
        }
    } else if (fileExtension === ".csv") {
        // Parse CSV file
        try {
            // Call the model function to parse and insert data
            const result = await parseCSVusers(filePath);
            console.log('result', result);


            // Check the result and send appropriate response
            if (result.status === 'success') {
                // If there are warnings, include them in the response
                return res.json({
                    status: 'success',
                    message: result.message,
                    warnings: result.warnings || [] // Send warnings if they exist
                });
            } else {
                // If there's an error, send the error message
                return res.status(500).json({
                    status: 'error',
                    message: result.message
                });
            }
        } catch (err) {
            console.error("Error uploading file:", err);
            return res.status(500).json({
                status: 'error',
                message: "An unexpected error occurred."
            });
        }
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


module.exports = {

    uploadFile
}