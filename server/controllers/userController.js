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
require('dotenv').config();
const generateToken = require('../utils/token');
const { logActivity } = require('../utils/logger');

const userModel = require('../models/userModel');
const transporter = require('../config/email');

// Function to create a new user/register
const registerUser = async (req, res) => {
  const { name, email, password, role, year, department, rollno, phone } =
    req.body;
  if (
    !name ||
    !email ||
    !password ||
    !role ||
    !year ||
    !department ||
    !rollno ||
    !phone
  ) {
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
      role,
      year,
      department,
      rollno,
      phone,
    );

    if (newUser) {
      await logActivity({
        user_id: newUser.user_id,
        activity: 'Register user',
        status: 'success',
        details: 'User registered successfully',
      });
      return res.status(201).json(newUser);
    }
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
      await logActivity({
        activity: 'Login attempt',
        status: 'failure',
        details: 'User not found',
      });
      return res.status(404).json({ error: 'User not found' });
    }
    const isPasswordMatch = await bcrypt.compare(
      password,
      result.password_hash
    );
    if (!isPasswordMatch) {
      await logActivity({
        user_id: user.user_id,
        activity: 'Login attempt',
        status: 'failure',
        details: 'Invalid password',
      });
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // JWT token signing
    const userData = {
      id: result.user_id,
      email: result.email,
      name: result.name,
      role: result.role,
    };

    const token = await generateToken(userData);

    await logActivity({
      user_id: userData.id,
      activity: 'Login attempt',
      status: 'success',
      details: 'User logged in successfully',
    });

    res.cookie('jwttoken', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    });
    return res.status(200).json({
      message: 'Login Successful',
      result: {
        id: result.user_id,
        email: result.email,
        name: result.name,
        role: result.role,
        created_at: result.created_at,
        status: result.status,
        department: result.department,
        year: result.year,
        rollno: result.rollno,
        phone: result.phone,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Function to update details of user
const updateUser = async (req, res) => {
  const { name, email, year, department, rollno, phone } =
    req.body;
  const id = req.params.user_id;
  console.log('ID', { id });
  if (
    !name ||
    !email ||
    !year ||
    !department ||
    !rollno ||
    !phone
  )
    return res.status(400).json({ error: 'All fields are required' });
  try {
    const updatedUser = await userModel.updateUser(
      id,
      name,
      email,
      year,
      department,
      rollno,
      phone
    );

    await logActivity({
      user_id: id,
      activity: 'Update user details',
      status: 'success',
      details: 'User details updated successfully',
    });
    console.log(updatedUser);
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
    await logActivity({
      user_id: id,
      activity: 'Delete user',
      status: 'success',
      details: 'User deleted successfully',
    });
    return res
      .status(200)
      .json({ message: 'User deleted successfully', deletedUser });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllPaginatedUsers = async (req, res) => {
  const user_id = req.user.id;
  const { page, limit, role } = req.query;
  let users;
  try {
    const numeberOfUsers = await userModel.getUserCount();
    if (!page && !limit) {
      users = await userModel.getAllStudents(role);
      await logActivity({
        user_id: user_id,
        activity: `Viewed Particular users`,
        status: 'success',
        details: `Viewed All queried users`,
      });
      return res.status(200).json({
        User_Count: numeberOfUsers,
        users,
      });
    } else {
      if (!role) {
        users = await userModel.getAllPaginatedUsers(
          parseInt(page),
          parseInt(limit)
        );
      } else {
        users = await userModel.getAllPaginatedRoleUsers(
          parseInt(page),
          parseInt(limit),
          role
        );
      }
      await logActivity({
        user_id: user_id,
        activity: `Viewed paginated users`,
        status: 'success',
        details: `Page: ${page}, Limit: ${limit}`,
      });
      return res.status(200).json({
        page: parseInt(page),
        limit: parseInt(limit),
        User_Count: numeberOfUsers,
        users,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllPaginatedUsers,

};
