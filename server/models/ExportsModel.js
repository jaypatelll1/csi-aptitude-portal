// models/ExportModel.js
const { query } = require("../config/db"); // Assuming you have a separate DB module


// Users
const getUserTable = async () => {
    try {
        const result = await query("SELECT * FROM users"); // Replace with your table
        return result.rows;
    } catch (err) {
        throw new Error("Error fetching data from database: " + err.message);
    }
};

const getQuestionTable = async () => {
    try {
        const result = await query("SELECT * FROM questions"); // Replace with your table
        return result.rows;
    } catch (err) {
        throw new Error("Error fetching data from database: " + err.message);
    }
};

const getResultTable = async () => {
    try {
        const result = await query("SELECT * FROM results"); // Replace with your table
        return result.rows;
    } catch (err) {
        throw new Error("Error fetching data from database: " + err.message);
    }
};

module.exports = {
    getUserTable,
    getQuestionTable,
    getResultTable
};
