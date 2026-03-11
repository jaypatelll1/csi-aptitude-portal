// models/user.js
const { dbWrite } = require('../config/db');

// Fetch all users
const getUsers = async () => {
  try {
    const users = await dbWrite("users")
      .select("user_id", "name", "email");

    return users;
  } catch (err) {
    throw new Error("Error fetching users: " + err.message);
  }
};

// Create new user
const createUser = async (name, email, password) => {
  try {
    const [user] = await dbWrite("users")
      .insert({
        name: name,
        email: email,
        password_hash: password,
        role: "Student"
      })
      .returning("*");

    return user;
  } catch (err) {
    throw new Error("Error creating user: " + err.message);
  }
};

// Get user by email
const getUserByEmail = async (email) => {
  try {
    const user = await dbWrite("users")
      .where({ email })
      .first();

    return user;
  } catch (err) {
    throw new Error("Error fetching user by email: " + err.message);
  }
};

module.exports = {
  getUsers,
  createUser,
  getUserByEmail,
};
