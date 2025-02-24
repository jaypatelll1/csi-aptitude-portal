const express = require('express');
const {
  generateRank
} = require('../controllers/rankController');

const router = express.Router();

router.get('/generate-rank', generateRank);

module.exports = router;
