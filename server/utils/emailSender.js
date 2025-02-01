const transporter = require('../config/email');
const { query } = require('../config/db');

const sendEmail = async (email, password) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Test Email',
    text: `Welcome to our APTITUDE PORTAL. THANK YOU for registering.\n\nYour credentials:\nEmail: ${email}\nPassword: ${password}`,
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
