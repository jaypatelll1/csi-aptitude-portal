const path = require("path");
const fs = require("fs");
const { Worker } = require("worker_threads");

const uploadQuestionFile = async (req, res) => {
    const timeoutDuration = 30000; // 30 seconds timeout
    let hasResponded = false;

    const filePath = path.resolve("uploads", req.file.filename);
    console.log("File path is:", filePath);
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const examId = req.params.exam_id;

    try {
        const worker = new Worker(path.join(__dirname, "..", "workers", "questionFileParser.js"), {
            workerData: { filePath, examId, fileExtension }
            
        });

        const timeout = setTimeout(() => {
            if (!hasResponded) {
                hasResponded = true;
                worker.terminate();
                res.status(500).json({ status: "error", message: "Worker timeout" });
            }
        }, timeoutDuration);

        console.log(`Timeout set for ${timeoutDuration / 1000} seconds`);

        res.on("close", () => {
            if (!hasResponded) {
                worker.terminate();
            }
        });

        worker.on("message", (message) => {
            if (hasResponded) return;
            hasResponded = true;
            clearTimeout(timeout);
            res.json(message);
        });

        worker.on("error", (error) => {
            if (hasResponded) return;
            hasResponded = true;
            clearTimeout(timeout);
            console.error("Worker error:", error);
            res.status(500).json({ status: "error", message: "Error processing file" });

            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error("Failed to delete file:", err);
            }
        });

        worker.on("exit", (code) => {
            if (code !== 0) {
                console.error(`Worker stopped with exit code ${code}`);
            }
        });

    } catch (err) {
        console.error("Error processing file:", err);
        res.status(500).json({ message: "Error processing file", error: err.message });

        try {
            fs.unlinkSync(filePath);
        } catch (err) {
            console.error("Failed to delete file:", err);
        }
    }
};

module.exports = { uploadQuestionFile };
