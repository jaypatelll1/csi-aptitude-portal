// models/user.js
const pool = require('../config/db');

// Function to fetch all users from the database
const getUsers = async () => {
  try {
    const result = await pool.query('SELECT user_id, name, email FROM users'); // Selecting relevant fields
    return result.rows;
  } catch (err) {
    throw new Error('Error fetching users: ' + err.message);
  }
};

// Function to create a new user
const createUser = async (name, email, password) => {
  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, email, password, "Student"] // Here password should be hashed (use bcrypt)
    );
    return result.rows[0];  // Return created user
  } catch (err) {
    throw new Error('Error creating user: ' + err.message);
  }
};

// Function to get a user by email
const getUserByEmail = async (email) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];  // Return the first user, or null if not found
  } catch (err) {
    throw new Error('Error fetching user by email: ' + err.message);
  }
};

module.exports = {
  getUsers,
  createUser,
  getUserByEmail,
};
