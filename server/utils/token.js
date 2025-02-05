const jwt = require('jsonwebtoken');

const generateToken = async (userData) => {
    return jwt.sign(userData, process.env.JWT_SECRET,{ expiresIn: '1h' });
};

const generateResetToken = async (userData) => {
    return jwt.sign(userData, process.env.RESET_SECRET, { expiresIn: '10m' });
};

module.exports = { generateToken, generateResetToken };
