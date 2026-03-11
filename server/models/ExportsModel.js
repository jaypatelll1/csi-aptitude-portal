// models/ExportModel.js

const { dbWrite } = require("../config/db");

/*
COMMON FUNCTION
*/
const fetchTable = async (tableName) => {
  try {
    const rows = await dbWrite(tableName).select("*");
    return rows;
  } catch (err) {
    throw new Error(`Error fetching data from ${tableName}: ${err.message}`);
  }
};

/*
USERS TABLE
*/
const getUserTable = async () => {
  return fetchTable("users");
};

/*
QUESTIONS TABLE
*/
const getQuestionTable = async () => {
  return fetchTable("questions");
};

/*
RESULTS TABLE
*/
const getResultTable = async () => {
  return fetchTable("results");
};

module.exports = {
  getUserTable,
  getQuestionTable,
  getResultTable
};
