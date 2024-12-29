// SCHEMA
// CREATE TABLE logs (
//     logs_id SERIAL PRIMARY KEY,
//     user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
//     activity VARCHAR(255) NOT NULL,
//     timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     status VARCHAR(50), -- e.g., "success" or "failure"
//     details TEXT -- Optional: Additional information about the activity
// );
  
const pool = require('../config/db');

const logActivity = async ({ user_id, activity, status, details = null }) => {
  const query = `
    INSERT INTO logs (user_id, activity, status, details)
    VALUES ($1, $2, $3, $4)
  `;
  const values = [user_id, activity, status, details];

  try {
    await pool.query(query, values);
  } catch (error) {
    console.error('Error logging activity:', error.message);
  }
};

module.exports = { logActivity };
