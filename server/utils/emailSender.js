const transporter = require('../config/email');
const { query } = require('../config/db');

const sendEmail = async (email, password) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to CSI Aptitude Portal',
    html: `
      <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 2px solid #007bff; border-radius: 10px; padding: 20px; text-align: center; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 15px; border-radius: 10px;">
          <h2 style="color: #007bff; margin: 0;">WELCOME TO CSI APTITUDE PORTAL</h2>
        </div>
        <p style="font-size: 16px; color: #333;">Thank you for registering on our Aptitude Portal.</p>
        <hr style="border: 0; height: 1px; background: #007bff; margin: 15px 0;">
        <p style="font-size: 16px;"><strong>Your Credentials:</strong></p>
        <div style="background: #007bff; color: white; padding: 10px; border-radius: 5px; text-align: left;">
          <p style="margin: 5px 0; color: white;"><strong>Email:</strong> <strong>${email}</strong></p>
          <p style="margin: 5px 0; color: white;"><strong>Password:</strong> <strong>${password}</strong></p>
        </div>
        <p style="margin-top: 20px; color: #555;">We recommend changing your password after logging in.</p>
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

module.exports = {sendEmailsToUsers, 
    sendBulkEmailToUsers};
