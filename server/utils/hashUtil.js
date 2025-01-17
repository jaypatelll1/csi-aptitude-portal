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

const verifyPassword = async (plainTextPassword, hashedPassword)=>{
    try{
        return await bcrypt.compare(plainTextPassword, hashedPassword);
    } catch(err){
        console.error("Error verifying password!", err);
        throw err;
    }
};

module.exports = {hashPassword ,verifyPassword};