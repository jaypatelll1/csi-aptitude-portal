const express = require('express');
const router = express.Router();
const {tokenController} = require("../controllers/tokenContoller")

router.post("/",tokenController);


module.exports = router;