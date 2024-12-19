/**
 * object format for login user : {
 *  "email":"",
 *  "password":""
 * }
 * 
 * 
 * object format for register request
 * {
 *  "name":"",
 *  "email":"",
 *  "passowrd":"",
 *  "role":""
 * }
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userModel = require('../models/userModel');

// Function to create a new user/register
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password)
    return console.log('All fields are required!');
  try {
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return console.log('User already exists.');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.createUser(
      name,
      email,
      hashedPassword,
      role
    );
    res.json(newUser);
  } catch (err) {
    console.error(err);
  }
};

// Function for logging in
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await userModel.findUserByEmail(email);
    if (!result) {
      return res.status(404).json({ message: 'Error' });
    }
    const decoded = bcrypt.compare(password, result.password_hash);
    if (!decoded) {
      return res.status(400).json({ message: 'Invalid Email or password' });
    }
    const token = jwt.sign(
      { id: result.user_id, email: result.email, name: result.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

// Function to update details of user
const updateUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const id = req.user.id;
  if (!name || !email || !password)
    return console.log('All fields are required!');
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await userModel.updateUser(
      id,
      name,
      email,
      hashedPassword,
      role
    );
    return res.json(updatedUser);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// Function to delete a user
const deleteUser = async (req, res) => {
  const id = req.user.id;
  try {
    const deletedUser = await userModel.deleteUser(id);
    return res.json({ message: 'User deleted successfully', deletedUser });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = { registerUser, loginUser, updateUser, deleteUser };
