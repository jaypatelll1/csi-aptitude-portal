const express = require('express');
const {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  getAllPaginatedExams,
  getPaginatedDraftededExams,
  getPaginatedScheduledExams,
  getPaginatedPastExams,
  scheduleExam,
  markPastExam,
  markLiveExam,
  getPaginatedlive,
  getScheduledExams
} = require('../controllers/examController');
const { authorizeRoles } = require('../middlewares/roleAuthMiddleware');
const { jwtAuthMiddleware } = require('../middlewares/jwtAuthMiddleware');

const router = express.Router();

router.post('/',jwtAuthMiddleware, authorizeRoles, createExam);


router.put('/:exam_id',jwtAuthMiddleware, authorizeRoles, updateExam);
router.put('/publish/:exam_id',jwtAuthMiddleware,authorizeRoles, scheduleExam); // to publish an exam
router.put('/past-exam/:exam_id',jwtAuthMiddleware,authorizeRoles, markPastExam); // to mark an exam as past
router.put('/live-exam/:exam_id',jwtAuthMiddleware,authorizeRoles, markLiveExam); // to mark an exam as past

router.delete('/:exam_id', jwtAuthMiddleware,authorizeRoles, deleteExam);

module.exports = router;