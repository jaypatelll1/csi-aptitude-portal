const express = require('express');
const {
  getDeptAvgScores,
  getTopScorers,
  getWeakScorers,
  getAccuracyRatePerDept,
  getDeptParticipationRate,
  getCategoryWiseAccuracy,
} = require('../controllers/tpoAnalysisController');

const router = express.Router();

router.get('/dept-avg', getDeptAvgScores);
router.get('/top-scorers', getTopScorers);
router.get('/weak-scorers', getWeakScorers);
router.get('/accuracy-per-dept', getAccuracyRatePerDept);
router.get('/dept-participation-rate', getDeptParticipationRate);
router.get('/category-accuracy', getCategoryWiseAccuracy);

module.exports = router;
