const path = require("path");
const { parseExcelUsers, parseCSVusers } = require("../models/UserFileModels");
const fs = require("fs/promises");
const ExcelJS = require("exceljs");
const { Worker } = require("worker_threads");

const uploadFile = async (req, res) => {
    
    const filePath = path.resolve('uploads', req.file.filename);
    console.log('file path is ', filePath);
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    if (fileExtension === ".xlsx" || fileExtension === ".xls") {
        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filePath);
            const worksheet = workbook.worksheets[0];

            const jsonData = [];
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber !== 1) { // Skipping the header row
                    jsonData.push(row.values.slice(1)); // Remove first empty column
                }
            });

            const userCount = jsonData.length;
            console.log(`Parsed user count from Excel: ${userCount}`);

            const worker = new Worker("./workers/fileParser.js", {
                workerData: {
                    // filePath : filePath,
                    jsonData,
                    fileExtension: fileExtension
                }
            });

            let hasResponded = false;

            res.on('close', () => worker.terminate());

            const baseTime = 30000; // 30 seconds base time
            const extraTimePerUser = 5000; // 5 seconds extra per user above 10
            const timeoutDuration = userCount > 10 ? baseTime + (userCount) * extraTimePerUser : baseTime;

            const timeout = setTimeout(() => {
                if (!hasResponded) {
                    hasResponded = true;
                    worker.terminate();
                    res.status(500).json({ status: 'error', message: 'Worker timeout' });
                }
            }, timeoutDuration);

            console.log(`Timeout set for ${timeoutDuration / 1000} seconds`);

            worker.on("message", async (message) => {
                if (hasResponded) return;
                hasResponded = true;
                clearTimeout(timeout);

                try {
                    console.log("Worker message:", message);
                    if (message.status === 'success') {
                        const fileExists = await fs.access(filePath).then(() => true).catch(() => false);

                        if (fileExists) {
                            await fs.unlink(filePath); // Delete the file
                            console.log(` File deleted: ${filePath}`);
                        } else {
                            console.log(` File not found: ${filePath}`);
                        }
                        res.json({
                            status: 'success',
                            message: message.message,
                            warnings: message.warnings || []
                        });
                    } else {
                        res.status(500).json({ status: 'error', message: message.message || 'Unknown error' });
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
                res.status(500).json({ status: 'error', message: error.message || 'Worker encountered an error' });
                worker.terminate();
            });

        } catch (err) {
            console.error("Error:", err);
            return res.status(500).json({ status: 'error', message: err.message || 'An unexpected error occurred' });
        }
    } else if (fileExtension === ".csv") {
        try {
            const worker = new Worker("./workers/fileParser.js", { workerData: { filePath, fileExtension } });
            let hasResponded = false;

            res.on('close', () => worker.terminate());

            const timeout = setTimeout(() => {
                if (!hasResponded) {
                    hasResponded = true;
                    worker.terminate();
                    res.status(500).json({ status: 'error', message: 'Worker timeout' });
                }
            }, 30000);

            worker.on("message", async (message) => {
                if (hasResponded) return;
                hasResponded = true;

                try {
                    console.log("Worker message:", message);
                    if (message.status === 'success') {
                        await fs.unlink(filePath);
                        res.json({ status: 'success', message: message.message, warnings: message.warnings || [] });
                    } else {
                        res.status(500).json({ status: 'error', message: message.message || 'Unknown error' });
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
                console.error("Worker error:", error);
                res.status(500).json({ status: 'error', message: error.message || 'Worker encountered an error' });
                worker.terminate();
            });

        } catch (err) {
            console.error("Error:", err);
            return res.status(500).json({ status: 'error', message: err.message || 'An unexpected error occurred' });
        }
    } else {
        res.status(400).send("Invalid file format. Only Excel and CSV files are supported.");
    }
};

module.exports = { uploadFile };
