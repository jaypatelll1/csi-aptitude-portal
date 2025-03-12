const express = require('express');
const {
  generateRank
} = require('../controllers/rankController');

const router = express.Router();

const {limiter} = require("../utils/rateLimitUtils");
router.use(limiter);

router.get('/generate-rank', generateRank);

module.exports = router;
