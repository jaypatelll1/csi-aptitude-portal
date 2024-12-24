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
const generateToken = require('../utils/token');


const userModel = require('../models/userModel');

// Function to create a new user/register
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    console.log('All fields are required!');
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.createUser(
      name,
      email,
      hashedPassword,
      role
    );
    return res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Function for logging in
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const result = await userModel.findUserByEmail(email);
    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isPasswordMatch = await bcrypt.compare(
      password,
      result.password_hash
    );
    if (!isPasswordMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // JWT token signing
    const userData =
    {
      id: result.user_id,
      email: result.email,
      name: result.name,
      role: result.role,
    }

    const token = await generateToken(userData) ;

    res.cookie('jwtToken', token,{
      httpOnly:true,
      sameSite:'strict',
      secure:true,
    })
    return res.status(200).send("Login successful");
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Function to update details of user
const updateUser = async (req, res) => {
  const { name, email, password } = req.body;
  const id = req.user.id;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields are required' });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await userModel.updateUser(
      id,
      name,
      email,
      hashedPassword
    );
    return res.status(200).json(updatedUser);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Function to delete a user
const deleteUser = async (req, res) => {
  const id = req.param.user_id;
  try {
    const deletedUser = await userModel.deleteUser(id);
    return res
      .status(200)
      .json({ message: 'User deleted successfully', deletedUser });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Pagination
const getAllPaginatedUsers = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const users = await userModel.getAllPaginatedUsers(parseInt(page), parseInt(limit));
    res
      .status(200)
      .json({ page: parseInt(page), limit: parseInt(limit), users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registerUser, loginUser, updateUser, deleteUser, getAllPaginatedUsers };