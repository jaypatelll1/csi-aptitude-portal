const { parentPort, workerData } = require('worker_threads');
const XLSX = require('xlsx');
const fs = require('fs');
const csvParser = require('csv-parser');
const { query } = require('../config/db');
const { generateRandomPassword } = require('../utils/randomPassword');
const { hashPassword } = require('../utils/hashUtil');
const { sendBulkEmailToUsers } = require('../utils/emailSender');

if (!workerData || !workerData.jsonData || !workerData.fileExtension) {
    parentPort.postMessage({
        status: 'error',
        message: 'Invalid worker data provided'
    });
    return;
}

async function main() {
    try {
        // console.log('Starting file processing...', workerData);
        
        let result;
        if (workerData.fileExtension === '.xlsx') {
            result = await parseExcelUsers(workerData.jsonData);
        } else {
            result = await parseCSVusers(workerData.jsonData);
        }
        
        console.log('Processing complete, sending result:', result);
        parentPort.postMessage(result);
    } catch (error) {
        console.error('Worker main error:', error);
        parentPort.postMessage({
            status: 'error',
            message: error.message || 'Unknown error in worker'
        });
    }
}
// made
main().catch(error => {
    console.error('Unhandled worker error:', error);
    parentPort.postMessage({
        status: 'error',
        message: 'Unhandled worker error'
    });
});

async function parseExcelUsers(jsonData) {
    try {
        // const workbook = XLSX.readFile(filePath);
        // const sheetNames = workbook.SheetNames;
        // const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
        const warnings = [];
        let index = 0;

        for (const row of jsonData) {
            try {
                const {
                    name = '',
                    email = '',
                    department = '',
                    year = '',
                    rollno = '',
                    phone = ''
                } = row;

                const password = generateRandomPassword(8, true);
                const passwordHash = await hashPassword(password.toString());
                const createdAt = new Date().toISOString();

                if (!name || !email || !department || !year || !rollno || !phone) {
                    warnings.push(`Row ${index + 1}: Skipped due to invalid data`);
                    index++;
                    continue;
                }

                const queryText = `
                    INSERT INTO users (name, email, password_hash, role, created_at, status, department, year, rollno, phone)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                `;
                const values = [name, email, passwordHash, 'Student', createdAt, 'NOTACTIVE', 
                              department, year, rollno, phone.toString()];

                await query(queryText, values);
                await sendBulkEmailToUsers(email, password);

            } catch (error) {
                if (error.code === '23505') {
                    warnings.push(`Row ${index + 1}: Skipped duplicate email - ${row.email}`);
                } else {
                    warnings.push(`Row ${index + 1}: Error - ${error.message}`);
                }
            }
            index++;
        }

        parentPort.postMessage({
            status: 'success',
            message: 'Data processed successfully',
            warnings: warnings.length > 0 ? warnings : null
        });

    } catch (error) {
        parentPort.postMessage({
            status: 'error',
            message: error.message || 'Failed to process Excel file'
        });
    }
}

async function parseCSVusers(filePath) {
    try {
        const jsonData = await new Promise((resolve, reject) => {
            const data = [];
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', (row) => data.push(row))
                .on('end', () => resolve(data))
                .on('error', (err) => reject(err));
        });

        const warnings = [];
        let index = 0;

        for (const row of jsonData) {
            try {
                const {
                    name = '',
                    email = '',
                    department = '',
                    year = '',
                    rollno = '',
                    phone = ''
                } = row;

                const password = generateRandomPassword(8, true);
                const passwordHash = await hashPassword(password.toString());
                const createdAt = new Date().toISOString();

                if (!name || !email || !department || !year || !rollno || !phone) {
                    warnings.push(`Row ${index + 1}: Skipped due to invalid data`);
                    index++;
                    continue;
                }

                const queryText = `
                    INSERT INTO users (name, email, password_hash, role, created_at, status, department, year, rollno, phone)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                `;
                const values = [name, email, passwordHash, 'Student', createdAt, 'NOTACTIVE', 
                              department, year, rollno, phone.toString()];

                await query(queryText, values);
                await sendBulkEmailToUsers(email, password);

            } catch (error) {
                if (error.code === '23505') {
                    warnings.push(`Row ${index + 1}: Skipped duplicate email - ${row.email}`);
                } else {
                    warnings.push(`Row ${index + 1}: Error - ${error.message}`);
                }
            }
            index++;
        }

        return {
            status: 'success',
            message: 'Data processed successfully',
            warnings: warnings.length > 0 ? warnings : null
        };

    } catch (error) {
        return {
            status: 'error',
            message: error.message || 'Failed to process CSV file'
        };
    }
}



