const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'Gmail', // Or your email service provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports = transporter;
