const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtAuthMiddleware = (req, res, next) => {
    // const token = req.body.token; // Token from the request body
    const token = req.header("Authorization")?.split(" ")[1]; // Bearer token
  
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

module.exports = { jwtAuthMiddleware };
