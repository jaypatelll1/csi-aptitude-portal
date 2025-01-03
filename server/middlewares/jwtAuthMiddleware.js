const jwt = require('jsonwebtoken');
const {generateToken} = require("../utils/token");

require('dotenv').config();

// For HTTP requests
const jwtAuthMiddleware = (req, res, next) => {
  // const token = req.header("Authorization")?.split(" ")[1]; // Bearer token
  const token = req.cookies.jwttoken;
  if (!token) {
    return res
      .status(401)
      .json({ message: 'Access Denied: No Token Provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid Token' });
    req.user = decoded; // Attach user details from the token to the request object
    next();
  });
};

const resetPasswordAuthMiddleware = (req, res, next) => {
  const resettoken = req.cookies.resettoken;
  const password = req.body;
  if (!resettoken) {
    return res.status(400).json({ error: 'Reset token is required' });
  }

  try {
    // console.log('Password', password);
    // Verify the reset token
    const decodedReset = jwt.verify(resettoken, process.env.RESET_SECRET);
    // Attach the user ID to the request object
    req.id = decodedReset.id;
    req.password = password;

    next();
  } catch (err) {
    console.error('Error verifying reset token:', err);
    res.status(401).json({ error: 'Invalid or expired reset token' });
  }
};

// For SOCKET requests
const sockettAuthMiddleware = (socket, next) => {
  const token = socket.handshake.headers.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('jwttoken='))
    .split('=')[1];
  if (!token) {
    return next(new Error('Access Denied: No Token Provided'));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Invalid Token'));
    socket.user = decoded; // Attach user details from the token to the socket object
    next();
  });
};


const tokenMiddleware = async (req, res, next) => {
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
    next();
   
  };

 

module.exports = { jwtAuthMiddleware, sockettAuthMiddleware ,resetPasswordAuthMiddleware, tokenMiddleware };
