const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const hashPassword = async (plainTextPassword)=>{
    try {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hashedPassword = bcrypt.hash(plainTextPassword, salt);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password', error);
        throw error;
    }
};

const verifyPassword = async (plainTextPassword, hashedPassword) => {
  try {
    // bcrypt.compare internally hashes the plainTextPassword with the salt stored in hashedPassword
    const isMatch = await bcrypt.compare(plainTextPassword, hashedPassword);
    return isMatch;
  } catch (err) {
    console.error("Error verifying password!", err);
    throw err;
  }
};


module.exports = {hashPassword ,verifyPassword};