require('dotenv').config();
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: process.env.RESET_TIME*60*1000, //time in millisecods for 15 min
    max: process.env.REQ_LIMIT
});

module.exports = {limiter};