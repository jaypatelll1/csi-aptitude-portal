const jwt = require('jsonwebtoken');
require('dotenv').config();

// For HTTP requests
const jwtAuthMiddleware = (req, res, next) => {
    // const token = req.header("Authorization")?.split(" ")[1]; // Bearer token
    const token = req.cookies.jwttoken;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Access Denied: No Token Provided" });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid Token" });
      req.user = decoded; // Attach user details from the token to the request object
      next();
    });
  };

// For SOCKET requests
const sockettAuthMiddleware = (socket, next) => {
  const token = socket.handshake.headers.cookie.split('; ').find((cookie) => cookie.startsWith('jwttoken=')).split('=')[1];
    if (!token) {
      return next(new Error("Access Denied: No Token Provided"));
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error("Invalid Token"));
      socket.user = decoded; // Attach user details from the token to the socket object
      next();
    });
  };

module.exports = { jwtAuthMiddleware, sockettAuthMiddleware };
