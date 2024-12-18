const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const {findUserByEmail, createUser} = require('../models/userModel')

// User registration controller

const registerUser = async (req, res)=>{
    const {name, email, password} = req.body;
    if(!name || !email || !password) return console.log("All fields are required!");
    try{
        const existingUser = await findUserByEmail(email);
        if(existingUser){
            return console.log("User already exists.");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await createUser(name,email, hashedPassword);
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
    const {email, password} = req.body;
    try {
        const result = await findUserByEmail(email);
        if(!result){
            return console.error("404 not found");
        }
        const decoded = bcrypt.compare(password, result.password_hash);
        if(!decoded){
            return console.error("Invalid Email or password");
        }
        console.log(result) //
        const token = jwt.sign({id:result.user_id, email:result.email, name:result.name}, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({
            "token":token
        });
    } catch (error) {
        // console.error("Unexpected error!", error.stack);
        console.log(error)
        res.status(500)
    }
}


// exporting the modules 
module.exports = {registerUser, loginUser}