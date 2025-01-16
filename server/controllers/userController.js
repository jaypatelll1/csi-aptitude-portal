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
 *  "password":"",
 *  "role":""
 * }
 */

// const bcrypt = require('bcryptjs');
require('dotenv').config();
const { generateToken, generateResetToken } = require('../utils/token');
const { logActivity } = require('../utils/logger');
const { hashPassword , verifyPassword } = require('../utils/hashUtil');
const jwt = require('jsonwebtoken');

const userModel = require('../models/userModel');
const transporter = require('../config/email');
const { token } = require('morgan');

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
       // Logging the failure activity for user already existing
       await logActivity({
        user_id: null,
        activity: 'User creation failed',
        status: 'failure',
        details: `User already exists with email: ${email}`
      });
      return res.status(409).json({ error: 'User already exists' });
    }
    const hashedPassword = await hashPassword(password, 10);
  
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

    if(newUser){
      await logActivity({ 
        user_id: newUser.user_id,
         activity: 'Register user',
          status: 'success', 
          details: 'User registered successfully' 
        });
      return res.status(201).json(newUser);
    }
  } catch (err) {
    console.error(err);
    // Log the failure activity for user registration error
  await logActivity({
    user_id: null,
    activity: 'Register user failed',
    status: 'failure',
    details: `Error: ${err.message}`
  });
  return res.status(500).json({ error: 'Internal server error' });
}
};

// Function for logging in
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const result = await userModel.findUserByEmail(email);
    if (!result) {
      await logActivity({ 
        // Log the failed login attempt if user is not found
        user_id: null,
        activity: 'Login attempt',
         status: 'failure', 
         details: 'User not found' });
      return res.status(404).json({ error: 'User not found' });
    }
    const isPasswordMatch = await verifyPassword(
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
    const resettoken = await generateResetToken(userData);

    // Log the success activity for user login
    await logActivity({ 
      user_id: userData.id,
       activity: 'Login attempt', 
       status: 'success', 
       details: 'User logged in successfully'
       });

    res.cookie('jwttoken', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    });

    if (result.status === 'NOTACTIVE') {
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
    // Log the failure activity for login error
    await logActivity({
      user_id: null,
      activity: 'Login failed',
      status: 'failure',
      details: `Error: ${error.message}`
    });
    return res.status(500).json({ error: 'Internal server error' });
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

const resetPassword = async (req, res) => {
  const newPassword = req.body.password;
  const resettoken = req.body.resettoken;

  const decoded = jwt.verify(resettoken, process.env.RESET_SECRET);
  try {
    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the user password using the `updateUser` model
    const updatedUser = await userModel.updateUser(decoded.id, {
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
  res.status(200).json({message : "Logged out" })

}

// Function to update details of user
const updateUser = async (req, res) => {
  const { name, email, password, role,year,department,rollno  } = req.body;
  const id = req.params.user_id;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields are required' });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await userModel.updateUser(id,name, email, hashedPassword,year,department,rollno );
    
    // Log the success activity for user update
    await logActivity({
      user_id: id,
      activity: 'Update user details',
        status: 'success', 
        details: 'User details updated successfully' });
    return res.status(200).json(updatedUser);
  } catch (err) {
    console.log(err);
     // Log the failure activity for update error
     await logActivity({
      user_id: id,
      activity: 'Update user failed',
      status: 'failure',
      details: `Error: ${err.message}`
    });
    return res.status(500).json({ error: 'Internal server error' })
  }
};

// Function to delete a user
const deleteUser = async (req, res) => {
  const id = req.params.user_id;
  try {
    console.log('Delete user id:', id);
    const deletedUser = await userModel.deleteUser(id);

     // Log the success activity for user deletion
    await logActivity({ 
      user_id: id, 
      activity: 'Delete user', 
      status: 'success', 
      details: 'User deleted successfully' 
    });

    return res.status(200).json({ message: 'User deleted successfully', deletedUser });
  } catch (err) {
    console.log(err);
    // Log the failure activity for delete error
    await logActivity({
      user_id: id,
      activity: 'Delete user failed',
      status: 'failure',
      details: `Error: ${err.message}`
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllPaginatedUsers = async (req, res) => {
  const user_id = req.user.id;
  const { page, limit, role } = req.query;
  let users;
  try {
    const users = await userModel.getAllPaginatedUsers(parseInt(page), parseInt(limit));
    
    // Log the success activity for viewing paginated users
    await logActivity({
      user_id : user_id,
      activity: `Viewed paginated exams`,
      status: 'success',
      details: `Page: ${page}, Limit: ${limit}`,
    })
    return res.status(200).json({ page: parseInt(page), limit: parseInt(limit), users });
  } catch (error) {
    // Log the failure activity for pagination error
    await logActivity({
      user_id: user_id,
      activity: `Failed to fetch paginated users`,
      status: 'failure',
      details: `Error: ${error.message}`
    });
    return res.status(500).json({ error: error.message });
  }
};

const sendResetEmail = async (req, res) => {
  const  student  = req.body.student;
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

    const resetLink =
    process.env.NODE_ENV === 'development'
      ? `http://localhost:3000/reset-password/${resettoken}`
      : `${process.env.FRONTEND_ORIGIN}/reset-password/${resettoken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: student.email,
      subject: 'CSI Aptitude Portal Password Reset',
      text: `Click on the link to reset your password. This link will only be valid of 10 minutes: ${resetLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'Error sending email' });
      }
      console.log('Email sent:', info.response);
      return res.status(200).json({ message: 'Email sent successfully' });
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

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
};
