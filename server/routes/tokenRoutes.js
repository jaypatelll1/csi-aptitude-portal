const express = require('express');
const router = express.Router();
const {tokenMiddleware}= require("../middlewares/jwtAuthMiddleware")

router.post("/",tokenMiddleware);


module.exports = router;