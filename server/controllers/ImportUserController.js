const path = require("path");
const { parseExcelUsers, parseCSVusers, } = require("../models/UserFileModels");
const fs = require("fs/promises");
const { Worker } = require("worker_threads");

const uploadFile = async (req, res) => {
    const filePath = path.resolve('uploads', req.file.filename);
    console.log('file path is ', filePath);
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    if (fileExtension === ".xlsx" || fileExtension === ".xls") {
        // Parse Excel file
        try {
            const worker = new Worker("./workers/fileParser.js", {workerData: {
                filePath : filePath,
                fileExtension : fileExtension
            }});
            let hasResponded = false;
        
            res.on('close', () => {
                worker.terminate();
            });
        
            // Add timeout handling
            const timeout = setTimeout(() => {
                if (!hasResponded) {
                    hasResponded = true;
                    worker.terminate();
                    res.status(500).json({
                        status: 'error',
                        message: 'Worker timeout'
                    });
                }
            }, 30000); // 30 second timeout
        
            worker.on("message", async (message) => {
                if (hasResponded) return;
                hasResponded = true;
                clearTimeout(timeout);
        
                try {
                    console.log("Worker message:", message);
                    if (message.status === 'success') {
                        await fs.unlink(filePath); // Delete file after successful processing
                        res.json({
                            status: 'success',
                            message: message.message,
                            warnings: message.warnings || []
                        });
                    } else {
                        res.status(500).json({
                            status: 'error',
                            message: message.message || 'Unknown error'
                        });
                    }
                } catch (err) {
                    console.error('Message handler error:', err);
                } finally {
                    worker.terminate();
                }
            });
            
            worker.on("error", (error) => {
                if (hasResponded) return;
                hasResponded = true;
                clearTimeout(timeout);
        
                console.error("Worker error:", error);
                res.status(500).json({
                    status: 'error',
                    message: error.message || 'Worker encountered an error'
                });
                worker.terminate();
            });
        } catch (err) {
            console.error("Error:", err);
            return res.status(500).json({
                status: 'error',
                message: err.message || 'An unexpected error occurred'
            });
        }
    } else if (fileExtension === ".csv") {
        // Parse CSV file
        try {
            const worker = new Worker("./workers/fileParser.js", {workerData: {
                filePath : filePath,
                fileExtension : fileExtension
            }});
            let hasResponded = false;
        
            res.on('close', () => {
                worker.terminate();
            });
        
            // Add timeout handling
            const timeout = setTimeout(() => {
                if (!hasResponded) {
                    hasResponded = true;
                    worker.terminate();
                    res.status(500).json({
                        status: 'error',
                        message: 'Worker timeout'
                    });
                }
            }, 30000); // 30 second timeout
        
            worker.on("message", async (message) => {
                if (hasResponded) return;
                hasResponded = true;
                clearTimeout(timeout);
        
                try {
                    console.log("Worker message:", message);
                    if (message.status === 'success') {
                        await fs.unlink(filePath); // Delete file after successful processing
                        res.json({
                            status: 'success',
                            message: message.message,
                            warnings: message.warnings || []
                        });
                    } else {
                        res.status(500).json({
                            status: 'error',
                            message: message.message || 'Unknown error'
                        });
                    }
                } catch (err) {
                    console.error('Message handler error:', err);
                } finally {
                    worker.terminate();
                }
            });
            
            worker.on("error", (error) => {
                if (hasResponded) return;
                hasResponded = true;
                clearTimeout(timeout);
        
                console.error("Worker error:", error);
                res.status(500).json({
                    status: 'error',
                    message: error.message || 'Worker encountered an error'
                });
                worker.terminate();
            });
        } catch (err) {
            console.error("Error:", err);
            return res.status(500).json({
                status: 'error',
                message: err.message || 'An unexpected error occurred'
            });
        }
    } else {
        res.status(400).send("Invalid file format. Only Excel and CSV files are supported.");
    }


    // setTimeout(() => {
    //     try {
    //         console.log('Deleting file:', filePath);
    //         fs.unlinkSync(filePath);
    //         console.log('File deleted successfully:', filePath);
    //     } catch (err) {
    //         console.error('Error deleting file:', err);
    //     }
    // }, 5000);

};


module.exports = {

    uploadFile
}