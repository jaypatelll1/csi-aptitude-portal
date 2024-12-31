const pool = require('../config/db');
const { paginate } = require('../utils/pagination');

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
const createUser = async (
  name,
  email,
  hashPassword,
  role,
  year,
  department,
  rollno,
  phone
) => {
  try {
    const query =
      'INSERT INTO users(name, email, password_hash, role, year, department, rollno, phone) VALUES($1, $2, $3, $4,$5,$6,$7,$8) RETURNING user_id, name, email, role, year, department, rollno, phone';
    const newUser = await pool.query(query, [
      name,
      email,  
      hashPassword,
      role,
      year,
      department,
      rollno,
      phone,
    ]);
    return newUser.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const getAllStudents = async (role) => {
  const query =
    'SELECT user_id, name, email, role, year, department, rollno, phone FROM users where role = $1 ORDER BY user_id ASC';
  const result = await pool.query(query, [role]);
  return result.rows;
};

// Function to update detalis of a user
const updateUser = async (
  id,
  name,
  email,
  year,
  department,
  rollno,
  phone
) => {
  try {
    console.log('Update parameters:', { id, name, email, year, department, rollno, phone });
    const query = `UPDATE users SET name=$1, email=$2 , year=$3 , department=$4 , rollno=$5, phone=$6 WHERE user_id=$7   RETURNING *`;
    const result = await pool.query(query, [
      name,
      email,
      year,
      department,
      rollno,
      phone,
      id,
    ]);
    return result.rows[0];
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// Function to delete a user
const deleteUser = async (id) => {
  console.log ('Delete user id:', id);
  try {
    const query = `DELETE FROM users WHERE user_id=$1 RETURNING *`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// Pagination
// Get all users with pagination
const getAllPaginatedUsers = async (page, limit) => {
  const query =
    'SELECT user_id, name, email, role,year,department,rollno FROM users ';
  const paginatedQuery = paginate(query, page, limit);
  const result = await pool.query(paginatedQuery);
  return result.rows;
};

const getAllPaginatedRoleUsers = async (page, limit, role) => {
  const query =
    'SELECT user_id, name, email, role,year,department,rollno FROM users where role =$1 ';
  const paginatedQuery = paginate(query, page, limit);
  const result = await pool.query(paginatedQuery, [role]);
  return result.rows;
};

const getAllRoleUsers = async (role) => {
  const query =
    'SELECT user_id, name, email, role,year,department,rollno FROM users where role =$1 ';
  const result = await pool.query(query, [role]);
  return result.rows;
};

const getUserCount = async () => {
  const query =
    'SELECT user_id, name, email, role,year,department,rollno FROM users WHERE role =$1 ';
  const user_TPO = await pool.query(query, ['TPO']);
  const user_Student = await pool.query(query, ['Student']);
  return {TPO : user_TPO.rowCount, Students: user_Student.rowCount};
};

module.exports = {
  findUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  getAllPaginatedUsers,
  getAllPaginatedRoleUsers,
  getUserCount,
  getAllStudents
};
