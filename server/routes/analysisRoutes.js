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
  generateAllAnalysis,
  getDepartmentAnalysis,
  getUserAnalysis,
  userAnalysis,
  getSingleUserAnalysis
} = require('../controllers/analysisController');

const router = express.Router();

// Rate Limit
const {limiter} = require('../middlewares/rateLimitMiddleware');

router.get('/overall-results/:student_id', getOverallResultsOfAStudent);
router.get('/exam/:exam_id/:student_id', getResultOfAParticularExam);
router.get('/tests-completed/:student_id', testCompletion);
router.get('/avg-results/:student_id', avgResults);
router.get('/rank/:student_id', getStudentRank)
router.get('/performance-over-time/:student_id', getPerformanceOverTime)

router.get('/all-analysis', generateAllAnalysis)

router.get('/student-analysis', userAnalysis) // This will return all student analysis
router.get('/student-analysis/:student_id', getSingleUserAnalysis) // This will return analysis of a particular student


// router.get('/department', getDepartmentAnalysis); //-----------------
router.get('/department/:department_name', getDepartmentAnalysis); //-----------------
router.get('/user/:student_id', getUserAnalysis); //---------------

module.exports = router;
