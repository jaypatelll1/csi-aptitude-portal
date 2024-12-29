const fs = require('fs');
const XLSX = require('xlsx');
const csvParser = require('csv-parser');
const { query } = require("../config/db")
const { hashPassword } = require("../utils/hashUtil");
const { error } = require('console');


const parseExcelUsers = async (filePath) => {
    try {
        // Read the Excel file
        const workbook = XLSX.readFile(filePath,res);
        const sheetNames = workbook.SheetNames;
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
        console.log("Excel Data to insert:", jsonData);

        // Inserting each row into the database
        for (const row of jsonData) {
            const { user_id, name, email, password, role } = row;
            const created_at = new Date().toISOString();
            const password_hash = await hashPassword(password); // assuming hashPassword is async

            const queryText = 'INSERT INTO users(name,email,password_hash,role,created_at) VALUES ($1, $2, $3, $4, $5)';
            const values = [name, email, password_hash, role, created_at];

            // Run the query and wait for it to complete
            await query(queryText, values);
        }

        console.log('All data inserted successfully.');
    } catch (err) {
        res.json({error :err.detail})
    }
};

const parseCSVusers = async (filePath,res) => {
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

        console.log("CSV Data to insert:", jsonData);

        // Inserting each row into the database
        for (const row of jsonData) {
            const { user_id, name, email, password, role } = row;
            const created_at = new Date().toISOString();
            const password_hash = await hashPassword(password); // assuming hashPassword is async

            const queryText = 'INSERT INTO users(name,email,password_hash,role,created_at) VALUES ($1, $2, $3, $4, $5)';
            const values = [name, email, password_hash, role, created_at];

            // Run the query and wait for it to complete
            await query(queryText, values);
        }

        console.log('All data inserted successfully.');
    } catch (err) {
        res.json({error :err.detail})
    }
};





module.exports = {
    parseExcelUsers,
    parseCSVusers
    
};
