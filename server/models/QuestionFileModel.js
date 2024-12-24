const fs = require("fs")
const XLSX = require('xlsx');
const csvParser = require('csv-parser');
const { query } = require("../config/db")


const parseExcelQuestion = async (filePath,examId,res) => {
    try {
        // Read the Excel file
        const workbook = XLSX.readFile(filePath);
        const sheetNames = workbook.SheetNames;
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
        console.log("Excel Data to insert:", jsonData);

        // Inserting each row into the database
        for (const row of jsonData) {

            const { question_id, question_text, options, correct_option } = row;
            const queryText = 'INSERT INTO questions (question_id,exam_id,question_text,options,correct_option) VALUES ($1, $2, $3,$4,$5)';

        //  eg  options is   A:New York,B:Washington,C:Chicago

            const optionsObject = options
            .split(',')
            .reduce((acc, pair) => {
                const [key, value] = pair.split(':');
                acc[key.trim()] = value.trim(); // Trim spaces for clean keys/values
                return acc;
            }, {});

            const exam_id = examId ;
            const values = [question_id, exam_id, question_text, optionsObject, correct_option];

            // Run the query and wait for it to complete
            await query(queryText, values);
        }

        console.log('All data inserted successfully.');
    } catch (err) {
        res.json({error :err.detail})
    }
};

const parseCSVquestion = async (filePath,examId,res) => {
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
            const { question_id,  question_text, options, correct_option } = row;

          const exam_id = examId ;

          console.log('exam_id',exam_id);
          
          // Clean the options field before parsing it into JSON
          const cleanedOptions = options
          .replace(/"\s*'/g, '"')    // Remove extraneous quotes and spaces
          .replace(/'\s*"/g, '"')    // Remove extraneous quotes and spaces
          .replace(/\s*'/g, '"')     // Replace remaining single quotes with double quotes
          .replace(/(\w+)\s*:/g, '"$1":');  // Ensure the keys are quoted

      let parsedOptions;
      try {
          parsedOptions = JSON.parse(cleanedOptions);  // Parse stringified JSON
      } catch (err) {
          console.error('Invalid options format:', err);
          continue;  // Skip this row if options is invalid
      }

            const queryText = 'INSERT INTO questions (question_id,exam_id,question_text,options,correct_option) VALUES ($1, $2, $3,$4,$5)';
            
            const values = [question_id, exam_id, question_text, parsedOptions, correct_option];

            // Run the query and wait for it to complete
            await query(queryText, values);
        }

        console.log('All data inserted successfully.');
    } catch (err) {
        res.json({error :err.detail})
    }
};



module.exports = {
    
    parseExcelQuestion,
    parseCSVquestion
};
