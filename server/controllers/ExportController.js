const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");
const XLSX = require("xlsx");
const {getUserTable, getQuestionTable,getResultTable} = require("../models/ExportsModel")
const{ResultALL} = require("../utils/ResultAll")



const EXPORTS_DIR = path.resolve("./exports")

// Ensure exports directory exists
if (!fs.existsSync(EXPORTS_DIR)) {
    fs.mkdirSync(EXPORTS_DIR);
    console.log('directory created successfully ');
    
} else {
    console.log('error creating directory');
}

// Export to User CSV
const exportToUserCSV = async (req, res) => {
    try {
        const rows = await getUserTable(); // Fetch data from the database

        // Ensure that the file path resolves correctly
        const filePath = path.join(EXPORTS_DIR, "users.csv");

        // Create a writable stream
        const writableStream = fs.createWriteStream(filePath);

        // Write the rows to the CSV file
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
        const rows = await getUserTable(); // Fetch data from the database

       
        const filePath = path.join(EXPORTS_DIR, "users.xlsx");

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, filePath);

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
        const rows = await getQuestionTable(); // Fetch data from the database

        const result = rows.map((items) => ({
            question_id: items.question_id,
            exam_id: items.exam_id,
            question_text: items.question_text,
            options_a : items.options.a,
            options_b : items.options.b,
            options_c : items.options.c,
            options_d : items.options.d,
            correct_option: items.correct_option
        })
        )

        // Ensure that the file path resolves correctly
        const filePath = path.join(EXPORTS_DIR, "questions.csv");

        // Create a writable stream
        const writableStream = fs.createWriteStream(filePath);

        // Write the rows to the CSV file
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
        const rows = await getQuestionTable() ; // Fetch data from the database

        if (!Array.isArray(rows) || typeof rows[0] !== 'object') {
            console.error('Expected an array of objects, but got:', rows);
            return res.status(500).send('Invalid data format.');
        }
console.log('rows',rows);


const result = rows.map((items) => ({
    question_id: items.question_id,
    exam_id: items.exam_id,
    question_text: items.question_text,
    options_a : items.options.a,
    options_b : items.options.b,
    options_c : items.options.c,
    options_d : items.options.d,
    correct_option: items.correct_option
})
)

        const filePath = path.join(EXPORTS_DIR, "questions.xlsx");

        const worksheet = XLSX.utils.json_to_sheet(result);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, filePath);

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
        const {exam_id}= req.params ;
        const rows = await ResultALL(exam_id); // Fetch data from the database

        // Ensure that the file path resolves correctly
        const filePath = path.join(EXPORTS_DIR, "result.csv");

        // Create a writable stream
        const writableStream = fs.createWriteStream(filePath);

        // Write the rows to the CSV file
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
        const {exam_id}= req.params
        const rows = await ResultALL(exam_id); // Fetch data from the database
        const filePath = path.join(EXPORTS_DIR, "result.xlsx");

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, filePath);

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




module.exports = {
    exportToUserCSV,
    exportToUserExcel,
    exportToQuestionCSV,
    exportToQuestionExcel,
    exportToResultCSV,
    exportToResultExcel
};
