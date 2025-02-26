const express = require('express');
const {
  getOverallResultsOfAStudent,
  getResultOfAParticularExam,
  testCompletion,
  generateStudentAnalysis,
  generateStudentAnalysisUsingId,
  avgResults,
  getStudentRank,
  getPerformanceOverTime,
} = require('../controllers/analysisController');

const router = express.Router();

router.get('/overall-results/:student_id', getOverallResultsOfAStudent);
router.get('/exam/:exam_id/:student_id', getResultOfAParticularExam);
router.get('/tests-completed/:student_id', testCompletion);
router.get('/avg-results/:student_id', avgResults);
router.get('/rank/:student_id', getStudentRank)
router.get('/performance-over-time/:student_id', getPerformanceOverTime)

router.post('/student-analysis', generateStudentAnalysis)
router.post('/student-analysis/:student_id/:exam_id', generateStudentAnalysisUsingId)

module.exports = router;
