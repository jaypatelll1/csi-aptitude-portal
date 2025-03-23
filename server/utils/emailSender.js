const transporter = require('../config/email');
const { query } = require('../config/db');
require('dotenv').config();

const sendEmail = async (email, password) => {
  const portalLink = process.env.APTITUDE_PORTAL_LINK;
  // console.log('portalLink',portalLink);
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to CSI Aptitude Portal',
    html: `
<div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 2px solid #007bff; border-radius: 10px; padding: 20px; text-align: center; background-color: #f9f9f9;"> 
  
    <div style="background-color: #2C3E50; padding: 20px; border-top-left-radius: 10px; border-top-right-radius: 10px;">
      <i class="fas fa-laptop-code" style="font-size: 50px; color: white;"></i>
      <h2 style="color: white; margin-top: 10px;">CSI APTITUDE PORTAL</h2>
    </div>
  
    <h2 style="color: #007bff; margin: 20px 0;">WELCOME TO CSI APTITUDE PORTAL</h2>
  
    <p style="font-size: 16px; color: #333; padding: 0 20px; text-align: justify;">
      Congratulations! You are now part of the CSI Aptitude Portal, where learning meets opportunity. 
      Get ready to enhance your problem-solving skills and challenge yourself with aptitude tests curated by experts.
    </p>
  
    <p style="font-size: 16px; color: #333; padding: 0 20px; text-align: justify;">
      Stay tuned for exciting updates, practice quizzes, and insightful tips to sharpen your knowledge.
      We encourage you to explore the platform, take tests, and aim for excellence.
    </p>
  
    <hr style="border: 0; height: 1px; background: #007bff; margin: 15px 0;">
    
    <p style="font-size: 16px; text-align: justify;"><strong>Login Using:</strong></p>
    <div style="background: white; color: black; padding: 10px; border-radius: 5px; text-align: left; border: 2px solid #007bff;">
      <p style="margin: 5px 0; font-weight: bold; text-align: justify;">Email: <span style="font-weight: bold;">${email}</span></p>
      <p style="margin: 5px 0; font-weight: bold; text-align: justify;">Password: <span style="font-weight: bold;">${password}</span></p>
    </div>
  
    <a  href="${portalLink}"
      style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #28a745; 
             color: white; text-decoration: none; font-weight: bold; border-radius: 5px;">
      Access Your Portal
    </a>
  
    <p style="margin-top: 20px; color: #555; text-align: justify;">We recommend changing your password after logging in.</p>
  
    <div style="background: #2C3E50; color: white; padding: 10px; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">
      <p style="margin: 0; text-align: center;"> CSI-ACE</p>
    </div>
  
  </div>
    `,
  };



  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
  }
};


const sendResetPasswordEmail = async (email, resettoken) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Your Password for CSI Aptitude Portal',
    html: `
    <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 2px solid #007bff; border-radius: 10px; padding: 20px; text-align: center; background-color: #f9f9f9;"> 

      <div style="background-color: #2C3E50; padding: 20px; border-top-left-radius: 10px; border-top-right-radius: 10px;">
        <i class="fas fa-laptop-code" style="font-size: 50px; color: white;"></i>
        <h2 style="color: white; margin-top: 10px;">CSI APTITUDE PORTAL</h2>
      </div>
  
      <h2 style="color: #007bff; margin: 20px 0;">Reset Your Password</h2>
  
      <p style="font-size: 16px; color: #333; padding: 0 20px; text-align: justify; margin-bottom: 20px;">
        We received a request to reset your password for the CSI Aptitude Portal. To proceed, please click the button below to reset your password.
      </p>
  
      <hr style="border: 0; height: 1px; background: #007bff; margin: 15px 0;">
  
    
      <a href="${process.env.FRONTEND_URL}/reset-password/${resettoken}" 
        style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #ff5733; 
               color: white; text-decoration: none; font-weight: bold; border-radius: 5px; margin-bottom: 20px;">
        Reset Your Password
      </a>
  
      
      <div style="background: #2C3E50; color: white; padding: 10px; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">
        <p style="margin: 0; text-align: center;"> CSI-ACE</p>
      </div>
  
    </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send reset password email to ${email}:`, error);
  }
};


const sendEmailsToUsers = async () => {
  try {
    const result = await query('SELECT email, password_hash FROM users WHERE status = $1', ['NOTACTIVE']);
    for (const row of result.rows) {
      await sendEmail(row.email, row.password_hash);
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

const sendBulkEmailToUsers = async (email, password) => {
    try {
        await sendEmail(email, password);
    
  } catch (error) {
    console.error('Error fetching users:', error);
  };
}

// const sendResetPasswordEmail = async (email, resettoken) => {
//   try {
//     // Send the reset password email
//     await sendResetPasswordEmail(email, resettoken);
//   } catch (error) {
//     console.error('Error sending reset password email:', error);
//   }
// };



module.exports = {sendEmailsToUsers, 
    sendBulkEmailToUsers, sendResetPasswordEmail};
