const express = require('express');
const { jwtAuthMiddleware } = require('../middlewares/jwtAuthMiddleware');
const { getLastExamStats, getAllTestsStats, getAllStudentsStats,getAllStudentsStatsForDepartment } = require('../controllers/statsController');

const router = express.Router();

// Rate Limit
const {limiter} = require('../middlewares/rateLimitMiddleware');

router.get('/last-test', jwtAuthMiddleware, getLastExamStats);
router.get('/all-tests', jwtAuthMiddleware, getAllTestsStats);
router.get('/all-students', jwtAuthMiddleware, getAllStudentsStats);
router.get('/all-students/department', jwtAuthMiddleware, getAllStudentsStatsForDepartment);

module.exports = router;