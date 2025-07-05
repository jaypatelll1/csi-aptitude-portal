const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");
const ExcelJS = require("exceljs");
const { getUserTable, getQuestionTable, getResultTable } = require("../models/ExportsModel");
const { ResultALL } = require("../utils/ResultAll");

const EXPORTS_DIR = path.resolve("./exports");

// Ensure exports directory exists
if (!fs.existsSync(EXPORTS_DIR)) {
    fs.mkdirSync(EXPORTS_DIR);
    console.log('Directory created successfully');
} else {
    console.log('Directory already exists');
}

// Function to export data to Excel
const exportToExcel = async (data, filePath, sheetName) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);
    
    if (data.length > 0) {
        worksheet.columns = Object.keys(data[0]).map(key => ({ header: key, key }));
        worksheet.addRows(data);
    }
    
    await workbook.xlsx.writeFile(filePath);
};

// Export to User CSV
const exportToUserCSV = async (req, res) => {
    try {
        const rows = await getUserTable();
        const filePath = path.join(EXPORTS_DIR, "users.csv");
        
        const writableStream = fs.createWriteStream(filePath);
        csv.write(rows, { headers: true }).pipe(writableStream);

        writableStream.on("finish", () => {
            res.download(filePath, "users.csv", () => {
                // Delete file after sending to the client

         setTimeout(() => {
            try {
                console.log('Deleting file:', filePath);
                fs.unlinkSync(filePath);
                console.log('File deleted successfully:', filePath);
            } catch (err) {
                console.error('Error deleting file:', err);
            }
        }, 15000);

            });
        });
    } catch (err) {
        console.error("Error exporting to CSV:", err);
        res.status(500).send("Failed to export data.");
    }
};

// Export to User Excel
const exportToUserExcel = async (req, res) => {
    try {
        const rows = await getUserTable();
        const filePath = path.join(EXPORTS_DIR, "users.xlsx");
        
        await exportToExcel(rows, filePath, "Users");
        res.download(filePath, "users.xlsx", () => {
            // Delete file after sending to the client
            setTimeout(() => {
                try {
                    console.log('Deleting file:', filePath);
                    fs.unlinkSync(filePath);
                    console.log('File deleted successfully:', filePath);
                } catch (err) {
                    console.error('Error deleting file:', err);
                }
            }, 15000);
    
        });
    } catch (err) {
        console.error("Error exporting to Excel:", err);
        res.status(500).send("Failed to export data.");
    }
};

// Export to Question CSV
const exportToQuestionCSV = async (req, res) => {
    try {
        const rows = await getQuestionTable();
        const result = rows.map(item => ({
            question_id: item.question_id,
            exam_id: item.exam_id,
            question_text: item.question_text,
            options_a: item.options.a,
            options_b: item.options.b,
            options_c: item.options.c,
            options_d: item.options.d,
            correct_option: item.correct_option
        }));
        const filePath = path.join(EXPORTS_DIR, "questions.csv");
        
        const writableStream = fs.createWriteStream(filePath);
        csv.write(result, { headers: true }).pipe(writableStream);

        writableStream.on("finish", () => {
            res.download(filePath, "questions.csv", () => {
                // Delete file after sending to the client

         setTimeout(() => {
            try {
                console.log('Deleting file:', filePath);
                fs.unlinkSync(filePath);
                console.log('File deleted successfully:', filePath);
            } catch (err) {
                console.error('Error deleting file:', err);
            }
        }, 15000);

            });
        });
    } catch (err) {
        console.error("Error exporting to CSV:", err);
        res.status(500).send("Failed to export data.");
    }
};

// Export to Question Excel
const exportToQuestionExcel = async (req, res) => {
    try {
        const rows = await getQuestionTable();
        if (!Array.isArray(rows) || typeof rows[0] !== 'object') {
            console.error('Expected an array of objects, but got:', rows);
            return res.status(500).send('Invalid data format.');
        }
console.log('rows',rows);
        const result = rows.map(item => ({
            question_id: item.question_id,
            exam_id: item.exam_id,
            question_text: item.question_text,
            options_a: item.options.a,
            options_b: item.options.b,
            options_c: item.options.c,
            options_d: item.options.d,
            correct_option: item.correct_option
        }));
        const filePath = path.join(EXPORTS_DIR, "questions.xlsx");
        
        await exportToExcel(result, filePath, "Questions");
        res.download(filePath, "questions.xlsx", () => {
            // Delete file after sending to the client
            setTimeout(() => {
                try {
                    console.log('Deleting file:', filePath);
                    fs.unlinkSync(filePath);
                    console.log('File deleted successfully:', filePath);
                } catch (err) {
                    console.error('Error deleting file:', err);
                }
            }, 15000);
    
        });
    } catch (err) {
        console.error("Error exporting to Excel:", err);
        res.status(500).send("Failed to export data.");
    }
};


// Export to Result CSV
const exportToResultCSV = async (req, res) => {
    try {
        const { exam_id } = req.params;
        const rows = await ResultALL(exam_id);
        const filePath = path.join(EXPORTS_DIR, "result.csv");
        
        const writableStream = fs.createWriteStream(filePath);
        csv.write(rows, { headers: true }).pipe(writableStream);

        writableStream.on("finish", () => {
            res.download(filePath, "result.csv", () => {
                // Delete file after sending to the client

         setTimeout(() => {
            try {
                console.log('Deleting file:', filePath);
                fs.unlinkSync(filePath);
                console.log('File deleted successfully:', filePath);
            } catch (err) {
                console.error('Error deleting file:', err);
            }
        }, 15000);

            });
        });
    } catch (err) {
        console.error("Error exporting to CSV:", err);
        res.status(500).send("Failed to export data.");
    }
};

// Export to Result Excel
const exportToResultExcel = async (req, res) => {
    try {
        const { exam_id } = req.params;
        const rows = await ResultALL(exam_id);
        const filePath = path.join(EXPORTS_DIR, "result.xlsx");
        
        await exportToExcel(rows, filePath, "Results");
        res.download(filePath, "result.xlsx", () => {
            // Delete file after sending to the client
            setTimeout(() => {
                try {
                    console.log('Deleting file:', filePath);
                    fs.unlinkSync(filePath);
                    console.log('File deleted successfully:', filePath);
                } catch (err) {
                    console.error('Error deleting file:', err);
                }
            }, 15000);
    
        });
    } catch (err) {
        console.error("Error exporting to Excel:", err);
        res.status(500).send("Failed to export data.");
    }
};

const questionGeneratedExcel = async (req,res) => { 
    const questions = req.body.questions; // Expecting an array of questions

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Questions');

  // Define header row
  worksheet.columns = [
    { header: 'question_text', key: 'question_text' },
    { header: 'question_type', key: 'question_type' },
    { header: 'options_a', key: 'options_a' },
    { header: 'options_b', key: 'options_b' },
    { header: 'options_c', key: 'options_c' },
    { header: 'options_d', key: 'options_d' },
    { header: 'correct_option', key: 'correct_option' },
    { header: 'correct_options', key: 'correct_options' },
    { header: 'image_url', key: 'image_url' },
    { header: 'category', key: 'category' },
  ];

  // Add data rows
  questions.forEach((q) => {
    worksheet.addRow(q);
  });

  // Write to buffer and send
  const buffer = await workbook.xlsx.writeBuffer();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=questions.xlsx');
  res.send(buffer);

 }

module.exports = {
    exportToUserCSV,
    exportToUserExcel,
    exportToQuestionCSV,
    exportToQuestionExcel,
    exportToResultCSV,
    exportToResultExcel,
    questionGeneratedExcel
};
