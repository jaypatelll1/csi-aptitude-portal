const express = require('express');
const router = express.Router();
const {tokenMiddleware}= require("../middlewares/jwtAuthMiddleware")

router.post("/",tokenMiddleware);

// Rate Limit
const {limiter} = require('../middlewares/rateLimitMiddleware');


module.exports = router;