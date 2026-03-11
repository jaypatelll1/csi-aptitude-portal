const { dbWrite } = require("../config/db");
const { paginate } = require("../utils/pagination");

// Find user by email
const findUserByEmail = async (email) => {
  return await dbWrite("users")
    .where({ email })
    .first();
};

// Get user by ID
const getUserById = async (id) => {
  return await dbWrite("users")
    .where({ user_id: id })
    .first();
};

// Create user
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
  const [user] = await dbWrite("users")
    .insert({
      name,
      email,
      password_hash: passwordHash,
      role,
      year,
      department,
      rollno,
      phone,
    })
    .returning([
      "user_id",
      "name",
      "email",
      "role",
      "year",
      "department",
      "rollno",
      "phone",
    ]);

  return user;
};

// Get all students
const getAllStudents = async (role, year = null) => {
  let query = dbWrite("users")
    .select(
      "user_id",
      "name",
      "email",
      "role",
      "department",
      "year",
      "phone",
      "rollno"
    )
    .where({ role })
    .orderBy("user_id", "asc");

  if (year) {
    query.andWhere({ year });
  }

  return await query;
};

// Update user
const updateUser = async (id, updatedFields) => {
  const [user] = await dbWrite("users")
    .where({ user_id: id })
    .update(updatedFields)
    .returning("*");

  return user;
};

// Delete user
const deleteUser = async (id) => {
  const [user] = await dbWrite("users")
    .where({ user_id: id })
    .del()
    .returning("*");

  return user;
};

// Pagination
const getAllPaginatedUsers = async (page, limit) => {
  const offset = (page - 1) * limit;

  return await dbWrite("users")
    .select(
      "user_id",
      "name",
      "email",
      "role",
      "year",
      "department",
      "rollno",
      "phone"
    )
    .orderBy("user_id", "asc")
    .limit(limit)
    .offset(offset);
};

const getAllPaginatedRoleUsers = async (page, limit, role) => {
  const offset = (page - 1) * limit;

  return await dbWrite("users")
    .select(
      "user_id",
      "name",
      "email",
      "role",
      "year",
      "department",
      "rollno",
      "phone"
    )
    .where({ role })
    .orderBy("user_id", "asc")
    .limit(limit)
    .offset(offset);
};

// Department users
const getDepartmentUsers = async (role, department) => {
  return await dbWrite("users")
    .select(
      "user_id",
      "name",
      "email",
      "role",
      "year",
      "department",
      "rollno",
      "phone"
    )
    .where({ role, department })
    .orderBy("user_id", "asc");
};

// All users of a role
const getAllRoleUsers = async (role) => {
  return await dbWrite("users")
    .select(
      "user_id",
      "name",
      "email",
      "role",
      "year",
      "department",
      "rollno",
      "phone"
    )
    .where({ role })
    .orderBy("user_id", "asc");
};

// Count users
const getUserCount = async () => {
  const [tpo] = await dbWrite("users").where({ role: "TPO" }).count();
  const [students] = await dbWrite("users").where({ role: "Student" }).count();
  const [teachers] = await dbWrite("users").where({ role: "Teacher" }).count();

  return {
    TPO: Number(tpo.count),
    Students: Number(students.count),
    Teachers: Number(teachers.count),
  };
};

// Get basic users
const getUsers = async () => {
  return await dbWrite("users").select("user_id", "name", "email");
};

// Get user by email
const getUserByEmail = async (email) => {
  return await dbWrite("users")
    .where({ email })
    .first();
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
  getAllRoleUsers
};
