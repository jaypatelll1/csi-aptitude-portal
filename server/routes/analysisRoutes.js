const express = require('express');
const {
  getOverallResultsOfAStudent,
  getResultOfAParticularExam,
  testCompletion,
} = require('../controllers/analysisController');

const router = express.Router();

router.get('/overall-results/:student_id', getOverallResultsOfAStudent);
router.get('/exam/:exam_id/:student_id', getResultOfAParticularExam);
router.get('/tests-completed/:student_id', testCompletion);

module.exports = router;
