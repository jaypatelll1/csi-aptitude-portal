const fs = require('fs');
const XLSX = require('xlsx');
const csvParser = require('csv-parser');
const { query } = require('../config/db');
const { hashPassword } = require('../utils/hashUtil');
const { sendBulkEmailToUsers } = require('../utils/emailSender');
const { generateRandomPassword } = require('../utils/randomPassword');

const parseExcelUsers = async (filePath) => {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
    // console.log("Excel Data to insert:", jsonData);

    const warnings = []; // Collect all warnings here
    let index = 0;

    // Process each row
    for (const row of jsonData) {
      try {
        // Destructure and validate row data
        const {
          user_id,
          name = '',
          email = '',
          department = '',
          year = '',
          rollno = '',
          phone = '',
        } = row;
        const password = generateRandomPassword(8, true)
        // Ensure password is a string
        const passwordHash = await hashPassword(password.toString());

        const createdAt = new Date().toISOString();

        // Check if the row data is valid
        if (
          !name ||
          !email ||
          !password ||
          !department ||
          !year ||
          !rollno ||
          !phone
        ) {
          warnings.push(
            `Row ${index + 1}: Skipped due to invalid data - ${JSON.stringify(row)}`
          );
          index++; // Increment index
          continue; // Skip this row
        }

        // Query to insert data
        const queryText = `
                    INSERT INTO users (name, email, password_hash, role, created_at, status, department, year, rollno, phone)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                `;
        const values = [
          name,
          email,
          passwordHash,
          'Student',
          createdAt,
          'NOTACTIVE',
          department,
          year,
          rollno,
          phone.toString(),
        ];

        try {
          // Attempt to insert the row into the database
          await query(queryText, values);
          await sendBulkEmailToUsers(email, password);
        } catch (error) {
          // console.log('dbError',error);

          // If the error is a duplicate email (unique constraint violation), skip the row
          if (error.code === '23505') {
            warnings.push(
              `Row ${index + 1}: Skipped due to duplicate email - ${email}`
            );
            console.log('warnings', warnings);
          } else {
            // For other errors, log the error but continue
            console.error(`Error inserting row: ${JSON.stringify(row)}`, error);
          }
          // Continue to the next row without throwing
        }
      } catch (rowError) {
        console.error(`Error processing row: ${JSON.stringify(row)}`, rowError);
      }

      index++; // Increment index for each row processed
    }

    console.log('All data processed successfully.');
    if (warnings.length > 0) {
      // console.log("Warnings:", warnings.join('\n'));
      return {
        status: 'success',
        message: 'Data processed successfully.',
        warnings: warnings.length > 0 ? warnings : null,
      };
    }
    return {
      status: 'success',
      message: 'All data processed successfully.',
      warnings: null,
    };
  } catch (err) {
    console.error('Error processing Excel file:', err);
    // throw new Error("Failed to parse and insert Excel data");
    return {
      status: 'error',
      message: err.message || 'Error inserting data into the database',
    };
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

    const warnings = []; // Array to collect warnings
    let index = 0; // Initialize the index for row tracking

    // Process each row in the CSV file
    for (const row of jsonData) {
      const {
        user_id,
        name,
        email,
        password,
        department,
        year,
        rollno,
        phone,
      } = row;
      const created_at = new Date().toISOString();
      const password_hash = await hashPassword(password); // assuming hashPassword is async

      // Skip invalid rows if any fields are missing
      if (
        !name ||
        !email ||
        !password ||
        !department ||
        !year ||
        !rollno ||
        !phone
      ) {
        warnings.push(
          `Row ${index + 1}: Skipped due to missing data - ${JSON.stringify(row)}`
        );
        index++; // Increment index for skipped row
        continue; // Skip this row
      }

      const queryText = `
                INSERT INTO users (name, email, password_hash, role, created_at, status, department, year, rollno, phone)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `;
      const values = [
        name,
        email,
        password_hash,
        'Student',
        created_at,
        'NOTACTIVE',
        department,
        year,
        rollno,
        phone.toString(),
      ];

      try {
        // Attempt to insert the row into the database
        await query(queryText, values);
      } catch (error) {
        console.log('Error inserting row:', error);

        // If the error is a duplicate email (unique constraint violation), skip the row
        if (error.code === '23505') {
          warnings.push(
            `Row ${index + 1}: Skipped due to duplicate email - ${email}`
          );
          console.log(
            `Duplicate email found. Skipping row ${index + 1} with email: ${email}`
          );
        } else {
          // For other errors, log the error but continue
          console.error(
            `Error inserting row: ${JSON.stringify(row)} - Error:`,
            error
          );
        }

        // Continue to the next row
      }

      index++; // Increment index for each row processed
    }

    console.log('All data processed successfully.');
    if (warnings.length > 0) {
      // console.log("Warnings:", warnings.join('\n'));
      return {
        status: 'success',
        message: 'Data processed successfully.',
        warnings: warnings.length > 0 ? warnings : null,
      };
    }
  } catch (err) {
    console.error('Error processing CSV file:', err);
    return {
      status: 'error',
      message: err.message || 'Error inserting data into the database',
    };
  }
};

module.exports = {
  parseExcelUsers,
  parseCSVusers,
};
