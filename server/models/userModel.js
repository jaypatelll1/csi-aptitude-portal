

const {query} = require('../config/db');
// service for userByEmail

// Create user table in database 
const createUserTable = async ()=>{
    try{
        const queryText = `CREATE TABLE users(
        )`
    } catch(err){
        console.error(err.stack);
    }
}

const findUserByEmail = async (email)=>{
    try{
        const queryText = "SELECT * FROM users WHERE email = $1::text;"
        const result = await query(queryText, [email]);
        return result.rows[0];
    } catch(err) {
        console.error(err);
        throw err;
    }
};

// service model for creating new user

const createUser = async (name, email, hashPassword)=>{
    try {
        const queryText = "INSERT INTO users(name, email, password_hash, role) VALUES($1, $2, $3, $4) RETURNING user_id, name, email";
        const newUser = await query(queryText, [name, email, hashPassword, 'Student']);
        return newUser.rows[0];
    } catch(err){
        console.error(err);
        throw err;
    }
}

// const getUserId = async (userEmail)


module.exports = {findUserByEmail, createUser};