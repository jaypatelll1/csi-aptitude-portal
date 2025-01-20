const fs = require('fs');
const XLSX = require('xlsx');
const csvParser = require('csv-parser');
const { query } = require("../config/db")
const { hashPassword } = require("../utils/hashUtil");
const { error } = require('console');


const parseExcelUsers = async (filePath) => {
    try {
        // Read the Excel file
        const workbook = XLSX.readFile(filePath);
        const sheetNames = workbook.SheetNames;
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
        console.log("Excel Data to insert:", jsonData);
// console.log('jsonData',jsonData);

        // Process each row
        for (const row of jsonData) {
            try {
                // Destructure and validate row data
                const {
                    user_id,
                    name = '',
                    email = '',
                    password = '',
                    role = '',
                    status = '',
                    department = '',
                    year = '',
                    rollno = '',
                    phone = ''
                } = row;

                // Ensure password is a string
                const passwordHash = await hashPassword(password.toString());

                const createdAt = new Date().toISOString();

                // Query to insert data
                const queryText = `
                    INSERT INTO users (name, email, password_hash, role, created_at, status, department, year, rollno, phone)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                `;
                const values = [
                    name,
                    email,
                    passwordHash,
                    role,
                    createdAt,
                    status,
                    department,
                    year,
                    rollno,
                    phone.toString()
                ];

                // console.log('Inserting row:', values);

                // Execute query
                await query(queryText, values);
            } catch (rowError) {
                console.error(`Error inserting row: ${JSON.stringify(row)}`, rowError);
                // Optionally continue to the next row without throwing
            }
        }

        console.log('All data processed successfully.');
    } catch (err) {
        console.error("Error processing Excel file:", err);
        throw new Error("Failed to parse and insert Excel data");
    }
};


const parseCSVusers = async (filePath) => {
    try {
        const jsonData = await new Promise((resolve, reject) => {
            const data = [];
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', (row) => {
                    data.push(row);
                })
                .on('end', () => {
                    resolve(data);
                })
                .on('error', (err) => {
                    reject(err);
                });
        });

        // console.log("CSV Data to insert:", jsonData);

        // Inserting each row into the database
        for (const row of jsonData) {
            const { user_id, name, email, password, role , status,department , year, rollno ,phone}  = row;
            const created_at = new Date().toISOString();
            const password_hash = await hashPassword(password); // assuming hashPassword is async

            const queryText =   `
            INSERT INTO users (name, email, password_hash, role, created_at, status, department, year, rollno, phone)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `;
            const values = [name, email, password_hash, role, created_at , status,department , year, rollno ,phone];
            // console.log('values is department',department,year,rollno,phone);
            


            // Run the query and wait for it to complete
            await query(queryText, values);
        }

        console.log('All data inserted successfully.');
    } catch (err) {
        console.error("Error inserting data:", err);
        throw new Error(err.detail || "Error inserting data into the database");
    }
};





module.exports = {
    parseExcelUsers,
    parseCSVusers
    
};