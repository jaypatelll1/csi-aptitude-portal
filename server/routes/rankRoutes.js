const express = require('express');
const {
  generateRank,
  GetStudentRanksInAscOrder
} = require('../controllers/rankController');

const router = express.Router();

// Rate Limit
const {limiter} = require('../middlewares/rateLimitMiddleware');

router.get('/generate-rank', generateRank);
router.get('/generate-rank-order/', GetStudentRanksInAscOrder);

module.exports = router;
