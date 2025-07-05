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

const getUserById = async (id) => {
  try {
    const query = 'SELECT * FROM users WHERE user_id = $1;';
    const result = await pool.query(query, [id]);
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
  passwordHash,
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
      passwordHash,
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

const getAllStudents = async (role, year = null) => {
  let query = `
    SELECT user_id, name, email, role, department, year, phone, rollno  
    FROM users 
    WHERE role = $1`;

  const values = [role];

  if (year) {
    query += ` AND year = $2`;
    values.push(year);
  }

  query += ` ORDER BY user_id ASC`;

  const result = await pool.query(query, values);
  return result.rows;
};


// Function to update a user
const updateUser = async (id, updatedFields) => {
  const query = `UPDATE users SET ${Object.keys(updatedFields).map((key, index) => `${key} = $${index + 1}`).join(', ')} WHERE user_id = $${Object.keys(updatedFields).length + 1} RETURNING *`;
  const values = [...Object.values(updatedFields), id];

  const result = await pool.query(query, values);
  return result.rows[0]; // Return the updated user
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
    'SELECT user_id, name, email, role,year,department,rollno,phone FROM users ORDER BY user_id ASC';
  const paginatedQuery = paginate(query, page, limit);
  const result = await pool.query(paginatedQuery);
  return result.rows;
};

const getAllPaginatedRoleUsers = async (page, limit, role) => {
  const query =
    'SELECT user_id, name, email, role,year,department,rollno, phone FROM users where role =$1 ORDER BY user_id ASC ';
  const paginatedQuery = paginate(query, page, limit);
  const result = await pool.query(paginatedQuery, [role]);
  return result.rows;
};

const getDepartmentUsers = async (role ,department) => {
  const query =
    `SELECT user_id, name, email, role,year,department,rollno, phone FROM users where role =$1 AND 
    department = $2  ORDER BY user_id ASC  `;

  const result = await pool.query(query, [role ,department]);
  return result.rows;
}


const getAllRoleUsers = async (role) => {
  const query =
    'SELECT user_id, name, email, role,year,department,rollno,phone FROM users where role =$1 ORDER BY user_id ASC';
  const result = await pool.query(query, [role]);
  return result.rows;
};

const getUserCount = async () => {
  const query =
    'SELECT COUNT(*) FROM users WHERE role =$1 ';
  const user_TPO = await pool.query(query, ['TPO']);
  const user_Student = await pool.query(query, ['Student']);
  const user_Teacher = await pool.query(query, ['Teacher']);
  return {TPO : user_TPO.rows[0].count, Students: user_Student.rows[0].count, Teachers: user_Teacher.rows[0].count};
};



const getUsers = async () => {
  try {
    const result = await pool.query('SELECT user_id, name, email FROM users'); // Selecting relevant fields
    return result.rows;
  } catch (err) {
    throw new Error('Error fetching users: ' + err.message);
  }
};


const getUserByEmail = async (email) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];  // Return the first user, or null if not found
  } catch (err) {
    throw new Error('Error fetching user by email: ' + err.message);
  }
};

module.exports = {
  findUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  getAllPaginatedUsers,
  getAllPaginatedRoleUsers,
  getDepartmentUsers,
  getUserCount,
  getAllStudents,
  getUserById,
  getUsers,
  getUserByEmail,
};

