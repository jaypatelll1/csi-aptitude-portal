const { parentPort, workerData } = require('worker_threads');
const { query } = require('../config/db');
const { generateRandomPassword } = require('../utils/randomPassword');
const { hashPassword } = require('../utils/hashUtil');
const { sendBulkEmailToUsers } = require('../utils/emailSender');

if (!workerData || !workerData.jsonData || !workerData.fileExtension || !workerData.role) {
    parentPort.postMessage({ status: 'error', message: 'Invalid worker data provided' });
    return;
}

if (!Array.isArray(workerData.jsonData) || workerData.jsonData.length === 0) {
    parentPort.postMessage({ status: 'error', message: 'Invalid or empty data provided' });
    return;
}

// Get role from workerData
const role = workerData.role; // Role is directly passed

async function processUsers() {
    try {
        const warnings = [];

        let index = 0;
        for (const row of workerData.jsonData) {
            try {
                const name = row[0] || '';
                const email = (typeof row[1] === 'object' && row[1] !== null) ? row[1].text : row[1] || '';
                const department = row[2] || '';
                const year = row[3] || '';
                const rollno = row[4] || '';
                const phone = row[5] || '';

                if (!name || !email || !department || !year || !rollno || !phone) {
                    warnings.push(`Row ${index + 1}: Skipped due to invalid data`);
                    continue;
                }

                // Check if the user already exists
                const existingUser = await query(`SELECT role FROM users WHERE email = $1`, [email]);
                if (existingUser.rows.length > 0) {
                    warnings.push(`Row ${index + 1}: Skipped - User already exists (${email})`);
                    continue;
                }

                const password = generateRandomPassword(8, true);
                const passwordHash = await hashPassword(password.toString());
                const createdAt = new Date().toISOString();

                const queryText = `
                    INSERT INTO users (name, email, password_hash, role, created_at, status, department, year, rollno, phone)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                `;
                const values = [name, email, passwordHash, role, createdAt, 'NOTACTIVE', department, year, rollno, phone.toString()];

                await query(queryText, values);
                await sendBulkEmailToUsers(email, password);

                warnings.push(`Row ${index + 1}: Successfully processed - ${email}`);

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
            warnings: warnings.length > 0 ? warnings : []
        });

    } catch (error) {
        parentPort.postMessage({
            status: 'error',
            message: error.message || 'Failed to process file'
        });
    }
}

// Run the processing function
processUsers().catch(error => {
    console.error('Unhandled worker error:', error);
    parentPort.postMessage({ status: 'error', message: 'Unhandled worker error' });
});



// async function parseCSVusers(filePath) {
//     try {
//         if (!fs.existsSync(filePath)) {
//             return { status: 'error', message: 'CSV file not found' };
//         }

//         const jsonData = await new Promise((resolve, reject) => {
//             const data = [];
//             fs.createReadStream(filePath)
//                 .pipe(csvParser())
//                 .on('data', (row) => data.push(row))
//                 .on('end', () => resolve(data))
//                 .on('error', (err) => reject(err));
//         });

//         const warnings = [];

//         let index = 0;

//         for (const row of jsonData) {
//             try {
//                 const {
//                     name = '',
//                     email = '',
//                     department = '',
//                     year = '',
//                     rollno = '',
//                     phone = ''
//                 } = row;
//                 console.log(`Processing Row ${index + 1}:`, row);
//                 const password = generateRandomPassword(8, true);
//                 const passwordHash = await hashPassword(password.toString());

//                 console.log(`Processing Row ${index + 1}:`, row);
//                 console.log(
//                     `Extracted -> Name: ${name}, Email: ${email}, Dept: ${department}, Year: ${year}, Rollno: ${rollno}, Phone: ${phone}`
//                 );

//                 const createdAt = new Date().toISOString();
//                 if (!name.trim() || !email.trim() || !department.trim() || !year.trim() || !rollno.trim() || !phone.trim()) {
//                     warnings.push(`Row ${index + 1}: Skipped due to invalid data`);
//                     continue; // No need to manually increment index
//                 }

//                 const queryText = `
//                     INSERT INTO users (name, email, password_hash, role, created_at, status, department, year, rollno, phone)
//                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
//                 `;
//                 const values = [name, email, passwordHash, 'Student', createdAt, 'NOTACTIVE', department, year, rollno, phone.toString()];

//                 await query(queryText, values);
//                 await sendBulkEmailToUsers(email, password);

//             } catch (error) {
//                 if (error.code === '23505') {
//                     warnings.push(`Row ${index + 1}: Skipped duplicate email - ${row.email}`);
//                 } else {
//                     warnings.push(`Row ${index + 1}: Error - ${error.message}`);
//                 }
//             }
//             index++;
//         }

//         return {
//             status: 'success',
//             message: 'Data processed successfully',
//             warnings: warnings.length > 0 ? warnings : []
//         };

//     } catch (error) {
//         return {
//             status: 'error',
//             message: error.message || 'Failed to process CSV file'
//         };
//     }
// }
