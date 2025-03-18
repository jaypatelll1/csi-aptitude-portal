require('dotenv').config();
const rateLimit = require('express-rate-limit');
const limiter = (reqLimit) => {
    return rateLimit({
    windowMs: process.env.RESET_TIME*60*1000, //time in millisecods for 15 min
    max: reqLimit
})};

module.exports = {limiter};