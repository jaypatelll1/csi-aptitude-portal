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
const { generateToken, generateResetToken } = require('../utils/token');
const { logActivity } = require('../utils/logger');
const { hashPassword } = require('../utils/hashUtil');

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
      phone
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
        user_id: result.user_id,
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
    const resetToken = await generateResetToken(userData);

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

    if (result.status === 'NOTACTIVE') {
      res.cookie('resettoken', resetToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
      });
    }

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

const resetPassword = async (req, res) => {
  const newPassword = req.password.password;

  if (!req.id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the user password using the `updateUser` model
    const updatedUser = await userModel.updateUser(req.id, {
      password_hash: hashedPassword,
      status: 'ACTIVE',
    });

    // Log the password reset activity
    await logActivity({
      user_id: req.id,
      activity: 'Password reset',
      status: 'success',
      details: 'Password reset successfully',
    });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// logout 
const logout = async (req,res) => {
  res.clearCookie('jwttoken', { path: '/' }); // Ensure path matches the one used for setting the cookie
  res.status(200).send('Logged out');

}

// Function to update details of user
const updateUser = async (req, res) => {
  const { name, email, year,password, department, role, rollno, phone } =
    req.body;
  const id = req.params.user_id;


  try {
    // Initialize an object to store fields that need updating
    const updatedFields = {};

    // Only include fields that were provided in the request
    if (name) updatedFields.name = name;
    if (email) updatedFields.email = email;
    if (password) {
      updatedFields.password_hash = await hashPassword(password); // Hash password if provided
    }
    if (role) updatedFields.role = role;
    if (year) updatedFields.year = year;
    if (department) updatedFields.department = department;
    if (rollno) updatedFields.rollno = rollno;
    if (phone) updatedFields.phone = phone; // Only update phone if provided

    // If no fields are provided, return an error
    if (Object.keys(updatedFields).length === 0) {
      return res.status(400).json({ error: 'No fields provided to update' });
    }

    // Update the user in the database with the changed fields
    const updatedUser = await userModel.updateUser(id, updatedFields);

    // Log the activity for user update
    await logActivity({
      user_id: id,
      activity: 'Update user details',
      status: 'success',
      details: 'User details updated successfully',
    });

    return res.status(200).json(updatedUser);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Function to delete a user
const deleteUser = async (req, res) => {
  const id = req.params.user_id;
  try {
    console.log('Delete user id:', id);
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
  resetPassword,
  logout
};
