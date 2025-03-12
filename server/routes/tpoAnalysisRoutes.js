const express = require('express');
const {
  getDeptAvgScores,
  getTopScorers,
  getWeakScorers,
  getAccuracyRatePerDept,
  getDeptParticipationRate,
  getCategoryWiseAccuracy,
  getAllTpoAnalysis,
} = require('../controllers/tpoAnalysisController');

const router = express.Router();

// Rate Limit
const {limiter} = require("../utils/rateLimitUtils");
// router.use(limiter);

router.get('/dept-avg', getDeptAvgScores); //
router.get('/top-scorers', getTopScorers);
router.get('/weak-scorers', getWeakScorers);
router.get('/accuracy-per-dept', getAccuracyRatePerDept); //
router.get('/dept-participation-rate', getDeptParticipationRate);
router.get('/category-accuracy', getCategoryWiseAccuracy);

router.get('/all-tpo-analysis', getAllTpoAnalysis)

module.exports = router;
