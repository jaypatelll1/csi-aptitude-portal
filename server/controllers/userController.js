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

// const bcrypt = require('bcryptjs');
require('dotenv').config();
const { generateToken, generateResetToken } = require('../utils/token');
const { logActivity } = require('../utils/logActivity');
const { hashPassword, verifyPassword } = require('../utils/hashUtil');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const transporter = require('../config/email');
const { token } = require('morgan');
const {generateRandomPassword} = require("../utils/randomPassword")
const { sendBulkEmailToUsers, sendResetPasswordEmail, } = require('../utils/emailSender');
const dotenv = require('dotenv');
const decryptPassword = require('../utils/decryptPassword');
dotenv.config();
// Function to create a new user/register
const registerUser = async (req, res) => {
  const { name, email, role, year, department, rollno, phone } =
    req.body;
  if(role === "Teacher"){
    if (
      !name ||
      !email ||
      !role ||
      !phone
    ) {
      console.log('All fields are required!');
      return res.status(400).json({ error: 'All fields are required' });
    }
  }else{
    if (
      !name ||
      !email ||
      !role ||
      !year ||
      !department ||
      !rollno ||
      !phone
    ) {
      console.log('All fields are required!');
      return res.status(400).json({ error: 'All fields are required' });
    }
  }
  try {

    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const password = generateRandomPassword(8, true)
    // Ensure password is a string
    const passwordHash = await hashPassword(password.toString());

    const newUser = await userModel.createUser(
      name,
      email,
      passwordHash,
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
      await sendBulkEmailToUsers(email, password);
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
    const decryptedPassword = await decryptPassword(password)
    const isPasswordMatch = await verifyPassword(
      decryptedPassword,
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
    const resettoken = await generateResetToken(userData);

    await logActivity({
      user_id: userData.id,
      activity: 'Login attempt',
      status: 'success',
      details: 'User logged in successfully',
    });
    res.cookie('jwttoken', token, {
      expires: new Date(Date.now() + 86400000),
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    });

    if (result.status === 'NOTACTIVE') {
      res.set('Access-Control-Expose-Headers', 'resettoken');
      res.set('resettoken', resettoken);
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
  const newPassword = req.body.password;
  const resettoken = req.body.resettoken;

  console.log('Reset password request:', req.body);

  if (!resettoken) {
    return res.status(400).json({ error: 'Reset token is required' });
  }

  try {
    // Decode the reset token to get the user ID
    const decoded = jwt.verify(resettoken, process.env.RESET_SECRET);
    console.log(decoded);
    const userId = decoded.id;

    const decryptedPassword = await decryptPassword(newPassword)

    // Hash the new password
    const hashedPassword = await hashPassword(decryptedPassword);

    // Update the user password using the `updateUser` model
    const updatedUser = await userModel.updateUser(userId, {
      password_hash: hashedPassword,
      status: 'ACTIVE',
    });

    // Log the password reset activity
    await logActivity({
      user_id: userId,
      activity: 'Password reset',
      status: 'success',
      details: 'Password reset successfully',
    });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Error resetting password:', err);
    await logActivity({
      user_id: null,
      activity: 'Password reset',
      status: 'failure',
      details: `Error: ${err.message}`,
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// logout 
const logout = async (req, res) => {
  res.clearCookie('jwttoken', {
    expires: new Date(Date.now() + 86400000),
    httpOnly: true,
    sameSite: 'None',
    secure: true,
  }); // Ensure path matches the one used for setting the cookie
  res.status(200).json({ message: "Logged out" })

}

// Function to update details of user
const updateUser = async (req, res) => {
  const { name, email, year, password, department, role, rollno, phone } =
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
  const user_role = req.user.role; // Get current user's role
  const { page, limit, role, department } = req.query;

  let users;
  try {
    const numeberOfUsers = await userModel.getUserCount();

    // Add year filter for TPO
    const isTPO = user_role === 'TPO';
    const yearFilter = isTPO ? 'BE' : null;

    if (!page && !limit && !department) {
      users = await userModel.getAllStudents(role, yearFilter); // modified
    } else {
      if (!role) {
        users = await userModel.getAllPaginatedUsers(
          parseInt(page),
          parseInt(limit),
          yearFilter // added
        );
      } else if (role || department) {
        users = await userModel.getDepartmentUsers(
          role,
          department,
          yearFilter // added
        );
      } else {
        users = await userModel.getAllPaginatedRoleUsers(
          parseInt(page),
          parseInt(limit),
          role,
          yearFilter // added
        );
      }
    }

    await logActivity({
      user_id: user_id,
      activity: `Viewed users`,
      status: 'success',
      details: `Page: ${page || 'all'}, Limit: ${limit || 'all'}, Year filter: ${yearFilter || 'none'}`,
    });

    return res.status(200).json({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      User_Count: numeberOfUsers,
      users,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const verifyResetToken = async (req, res) => {
  const resettoken = req.headers['resettoken'];
  console.log(req.headers);
  if (!resettoken) {
    return res.status(400).json({ error: 'Reset token is required' });
  }

  try {
    const decoded = jwt.verify(resettoken, process.env.RESET_SECRET);
    res.json({ message: 'Token is valid', userId: decoded.user_id });
  } catch (err) {
    console.error('Error verifying reset token:', err); // Log the error for debugging
    res.status(400).json({ error: 'Invalid or expired reset token' });
  }
};


const sendResetEmail = async (req, res) => {
  const student = req.body.student;
  console.log(student);

  if (!student.user_id) {
    return res.status(400).json({ error: 'ID is required' });
  }

  try {
    const resettoken = await generateResetToken({
      id: student.user_id,
      email: student.email,
      name: student.name,
      role: student.role,
    });
    await sendResetPasswordEmail(student.email, resettoken);

    return res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
//     const resetLink =
//       process.env.NODE_ENV === 'development'
//         ? `http://localhost:3000/reset-password/${resettoken}`
//         : `${process.env.FRONTEND_ORIGIN}/reset-password/${resettoken}`;

//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: student.email,
//       subject: 'CSI Aptitude Portal Password Reset',
//       text: `Click on the link to reset your password. This link will only be valid of 10 minutes: ${resetLink}`,
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.error('Error sending email:', error);
//         return res.status(500).json({ error: 'Error sending email' });
//       }
//       console.log('Email sent:', info.response);
//       return res.status(200).json({ message: 'Email sent successfully' });
//     });
//   } catch (error) {
//     console.error('Error sending email:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }

module.exports = {
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllPaginatedUsers,
  verifyResetToken,
  resetPassword,
  logout,
  sendResetEmail,
  sendResetPasswordEmail,
};