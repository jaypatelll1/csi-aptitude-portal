const express = require('express');
const { jwtAuthMiddleware } = require('../middlewares/jwtAuthMiddleware');
const { getLastExamStats, getAllTestsStats, getAllStudentsStats } = require('../controllers/statsController');

const router = express.Router();

router.get('/last-test', jwtAuthMiddleware, getLastExamStats);
router.get('/all-tests', jwtAuthMiddleware, getAllTestsStats);
router.get('/all-students', jwtAuthMiddleware, getAllStudentsStats);

module.exports = router;


