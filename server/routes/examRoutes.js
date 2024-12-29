const express = require('express');
const {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  getAllPaginatedExams,
  getPaginatedDraftededExams,
  getPaginatedPublishedExams,
  getPaginatedPastExams,
  publishExam,
  markPastExam
} = require('../controllers/examController');
const { authorizeRoles } = require('../middlewares/roleAuthMiddleware');
const { jwtAuthMiddleware } = require('../middlewares/jwtAuthMiddleware');

const router = express.Router();

router.post('/',jwtAuthMiddleware, authorizeRoles, createExam);

router.get('/',jwtAuthMiddleware, getAllPaginatedExams); // Pagination
router.get('/drafts', jwtAuthMiddleware,authorizeRoles, getPaginatedDraftededExams)
router.get('/published', jwtAuthMiddleware, getPaginatedPublishedExams);
router.get('/past', jwtAuthMiddleware, getPaginatedPastExams);
router.get('/find/:exam_id',jwtAuthMiddleware, getExamById);

router.put('/:exam_id',jwtAuthMiddleware, authorizeRoles, updateExam);
router.put('/publish/:exam_id',jwtAuthMiddleware,authorizeRoles, publishExam); // to publish an exam
router.put('/past-exam/:exam_id',jwtAuthMiddleware,authorizeRoles, markPastExam); // to mark an exam as past

router.delete('/:exam_id', jwtAuthMiddleware,authorizeRoles, deleteExam);

module.exports = router;