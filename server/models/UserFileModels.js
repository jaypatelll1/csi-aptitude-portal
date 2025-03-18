const fs = require('fs');
const ExcelJS = require('exceljs');
const csvParser = require('csv-parser');
const { query } = require('../config/db');
const { hashPassword } = require('../utils/hashUtil');
const { sendBulkEmailToUsers } = require('../utils/emailSender');
const { generateRandomPassword } = require('../utils/randomPassword');

const parseExcelUsers = async (filePath) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];
    const jsonData = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
      const rowData = {
        user_id: row.getCell(1).value,
        name: row.getCell(2).value || '',
        email: (typeof row.getCell(3).value === 'object' && row.getCell(3).value !== null) 
                 ? row.getCell(3).value.text 
                 : row.getCell(3).value || '',
        department: row.getCell(4).value || '',
        year: row.getCell(5).value || '',
        rollno: row.getCell(6).value || '',
        phone: row.getCell(7).value || '',
      };
      
      jsonData.push(rowData);
    });

    const warnings = [];
    const emailList = [];
    let index = 0;

    for (const row of jsonData) {
      try {
        const {
          user_id,
          name = '',
          email = '',
          department = '',
          year = '',
          rollno = '',
          phone = '',
        } = row;
        const password = generateRandomPassword(8, true);
        
        if (!name || !email || !password || !department || !year || !rollno || !phone) {
          warnings.push(`Row ${index + 1}: Skipped due to invalid data - ${JSON.stringify(row)}`);
          index++;
          continue;
        }

        const passwordHash = await hashPassword(password.toString());
        const createdAt = new Date().toISOString();

        const queryText = `
          INSERT INTO users (name, email, password_hash, role, created_at, status, department, year, rollno, phone)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (email) DO UPDATE 
          SET name = EXCLUDED.name, department = EXCLUDED.department, year = EXCLUDED.year, 
              rollno = EXCLUDED.rollno, phone = EXCLUDED.phone
        `;

        const values = [
          name, email, passwordHash, 'Student', createdAt, 'NOTACTIVE', department, year, rollno, phone.toString()
        ];

        await query(queryText, values);
        emailList.push({ email, password });

      } catch (rowError) {
        console.error(`Error processing row: ${JSON.stringify(row)}`, rowError);
      }
      index++;
    }

    if (emailList.length > 0) {
      await sendBulkEmailToUsers(emailList);
    }

    console.log('All data processed successfully.');
    return {
      status: 'success',
      message: 'Data processed successfully.',
      warnings: warnings.length > 0 ? warnings : null,
    };
  } catch (err) {
    console.error('Error processing Excel file:', err);
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

    const warnings = [];
    const emailList = [];
    let index = 0;

    for (const row of jsonData) {
      const {
        user_id,
        name,
        email,
        password = generateRandomPassword(8, true),
        department,
        year,
        rollno,
        phone,
      } = row;

      if (!name || !email || !password || !department || !year || !rollno || !phone) {
        warnings.push(`Row ${index + 1}: Skipped due to missing data - ${JSON.stringify(row)}`);
        index++;
        continue;
      }

      const created_at = new Date().toISOString();
      const password_hash = await hashPassword(password.toString());

      const queryText = `
        INSERT INTO users (name, email, password_hash, role, created_at, status, department, year, rollno, phone)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (email) DO UPDATE 
        SET name = EXCLUDED.name, department = EXCLUDED.department, year = EXCLUDED.year, 
            rollno = EXCLUDED.rollno, phone = EXCLUDED.phone
      `;

      const values = [
        name, email, password_hash, 'Student', created_at, 'NOTACTIVE', department, year, rollno, phone.toString()
      ];

      try {
        await query(queryText, values);
        emailList.push({ email, password });
      } catch (error) {
        console.log('Error inserting row:', error);
        warnings.push(`Row ${index + 1}: Failed due to an error - ${error.message}`);
      }

      index++;
    }

    if (emailList.length > 0) {
      await sendBulkEmailToUsers(emailList);
    }

    console.log('All data processed successfully.');
    return {
      status: 'success',
      message: 'Data processed successfully.',
      warnings: warnings.length > 0 ? warnings : null,
    };
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
