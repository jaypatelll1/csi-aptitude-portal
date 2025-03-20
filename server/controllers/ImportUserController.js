const path = require("path");
const { parseCSVusers } = require("../models/UserFileModels");
const fs = require("fs/promises");
const ExcelJS = require("exceljs");
const { Worker } = require("worker_threads");

const uploadFile = async (req, res) => {
    try {
       const {role} = req.query;

        if (!req.file) {
            return res.status(400).json({ status: "error", message: "No file uploaded" });
        }

        const filePath = req.file.path;
        const fileExtension = path.extname(req.file.originalname).toLowerCase();

        console.log("File path is", filePath);
        let jsonData = [];

        if (fileExtension === ".xlsx" || fileExtension === ".xls") {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filePath);
            const worksheet = workbook.worksheets[0];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber !== 1) {
                    jsonData.push(row.values.slice(1));
                }
            });
        } else if (fileExtension === ".csv") {
            jsonData = await parseCSVusers(filePath);
        } else {
            return res.status(400).json({ status: "error", message: "Invalid file format. Only Excel and CSV files are supported." });
        }

        console.log(`Parsed user count: ${jsonData.length}`);

        const worker = new Worker(path.resolve(__dirname, "../workers/fileParser.js"), {
            workerData: { jsonData, fileExtension, role } // Pass the correct role based on the uploader's role
        });

        let hasResponded = false;
        res.on("close", () => worker.terminate());

        const timeout = setTimeout(() => {
            if (!hasResponded) {
                hasResponded = true;
                worker.terminate();
                res.status(500).json({ status: "error", message: "Worker timeout" });
            }
        }, jsonData.length > 10 ? 30000 + jsonData.length * 5000 : 30000);

        console.log(`Timeout set for ${timeout / 1000} seconds`);

        worker.on("message", async (message) => {
            if (hasResponded) return;
            hasResponded = true;
            clearTimeout(timeout);

            console.log("Worker message:", message);

            if (message.status === "success") {
                try {
                    await fs.unlink(filePath);
                    console.log(`File deleted: ${filePath}`);
                } catch (unlinkError) {
                    console.error("Failed to delete file:", unlinkError);
                }

                res.json({ status: "success", message: message.message, warnings: message.warnings || [] });
            } else {
                res.status(500).json({ status: "error", message: message.message || "Unknown error" });
            }
        });

        worker.on("error", (error) => {
            if (hasResponded) return;
            hasResponded = true;
            clearTimeout(timeout);
            console.error("Worker error:", error);
            res.status(500).json({ status: "error", message: error.message || "Worker encountered an error" });
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ status: "error", message: err.message || "An unexpected error occurred" });
    }
};

module.exports = { uploadFile };
