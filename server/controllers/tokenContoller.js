const jwt = require('jsonwebtoken');
const {generateToken} = require("../utils/token");

require('dotenv').config();

const tokenController = async (req, res, next) => {
    const token = req.cookies.jwttoken;
    // console.log('token is ', token);
    
    const {id,email,name,role} = req.body
  
    const data = {
      "id" :id,
      "email" : email,
      "name" : name,
      "role" :role
    }
    // console.log('data is ', data );
    
  
    if (!token) {
      return res.status(401).json({ message: 'Access Denied: No Token Provided' });
    } else {
      try {
        const refreshToken = await generateToken(data); // Ensure `token` is compatible
        // console.log('refresh token is ',refreshToken );
        
        Object.keys(req.cookies).forEach((jwttoken) => {
          res.clearCookie(jwttoken, { path: '/' });
        });
        res.cookie('jwttoken', refreshToken, { httpOnly: true, secure: true });
        res.json({message : "token is processed" , refreshToken})
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error generating token' });
      }
    }
    
   
  };
  
  
  module.exports = {  tokenController };
  