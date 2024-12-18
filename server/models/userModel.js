const pool = require('../config/db');

// Function to find a user by email
const findUserByEmail = async (email) => {
  try {
    const query = 'SELECT * FROM users WHERE email = $1::text;';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Function to create a new user
const createUser = async (name, email, hashPassword, role) => {
  try {
    const query =
      'INSERT INTO users(name, email, password_hash, role) VALUES($1, $2, $3, $4) RETURNING user_id, name, email';
    const newUser = await pool.query(query, [name, email, hashPassword, role]);
    return newUser.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Function to update detalis of a user
const updateUser = async (id, name, email, hashPassword) => {
  try {
    const query = `UPDATE users SET name=$1, email=$2, password_hash=$3 WHERE user_id=$4 RETURNING *`;
    const result = await pool.query(query, [name, email, hashPassword, id]);
    return result.rows[0];
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// Function to delete a user
const deleteUser = async (id) => {
  try {
    const query = `DELETE FROM users WHERE user_id=$1 RETURNING *`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = { findUserByEmail, createUser, updateUser, deleteUser };
