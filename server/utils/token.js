const jwt = require('jsonwebtoken');

const generateToken = (userData) => {
    return jwt.sign(userData, process.env.JWT_SECRET);
};

const generateResetToken = (userData) => {
    return jwt.sign(userData, process.env.RESET_SECRET, { expiresIn: '1h' });
};

module.exports = { generateToken, generateResetToken };
