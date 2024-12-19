
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15*60*1000, //time in millisecods for 15 min
    max:5
})

module.exports = {limiter};