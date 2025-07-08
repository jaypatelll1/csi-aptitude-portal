const jwt = require('jsonwebtoken');
const Session = require('../models/Session');
require('dotenv').config();

const singleLoginMiddleware = async (req, res, next) => {
  const token = req.cookies.jwttoken;

  // Step 1: Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No Token Provided' });
  }

  try {
    // Step 2: Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 3: Check if the token is valid in DB
    const session = await Session.findOne({
      userId: decoded.userId,
      token: token,
      isActive: true
    });

    if (!session) {
      return res.status(403).json({ message: 'Session Expired or Already Logged In Elsewhere' });
    }

    // All good – attach user info & move forward
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid Token' });
  }
};

module.exports = singleLoginMiddleware;
