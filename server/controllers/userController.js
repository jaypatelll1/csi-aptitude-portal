const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {query} = require('../config/db');

const {findUserByEmail, createUser} = require('../models/userModel')


// Salt for bcrypt
const SALT_ROUNDS = 10;


// User registration controller

const registerUser = async (req, res)=>{
    const {userName, userEmail, password} = req.body;
    if(!userName || !userEmail || !password) return console.log("All fields are required!");
    const preparedTestQueryText = 'SELECT * FROM users WHERE email_id = $1::text';
    try{
        const existingUser = await findUserByEmail(userEmail);
        if(existingUser){
            return console.log("User already exists.");
        }
        const salt =await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await createUser(userName, userEmail, hashedPassword);
        const token = jwt.sign(newUser, process.env.JWT_SECRET);
        res.json({
            "user":newUser,
            "token":token
        })
    } catch(err){
        console.error(err);
    }
};

const loginUser = async (req, res)=>{
    const token = req.headers['authorization'];
    if(token){
        
    }
    const {userEmail, password} = req.body;
    try {
        const result = findUserByEmail(userEmail);
        if(!result){
            return console.error("404 not found");
        }
        const decoded = bcrypt.compare(password, result.password_hash);
        if(!decoded){
            return console.error("Invalid Email or password");
        }
        const token = jwt.sign({id:result.email, name:result.name}, process.env.JWT_SECRET);
        res.json({
            "token":token
        });
    } catch (error) {
        console.error("Unexpected error!", error.stack);
    }
}


// exporting the modules 
module.exports = {registerUser, loginUser}