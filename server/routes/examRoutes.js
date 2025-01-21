const express = require('express');
const {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  getAllPaginatedExams,
  getPaginatedDraftedExams,
  getPaginatedScheduledExams,
  getPaginatedPastExams,
  getPaginatedLiveExams,
  scheduleExam,
  markPastExam,
  markLiveExam,
  getExamsForUser
 
} = require('../controllers/examController');
const { authorizeRoles } = require('../middlewares/roleAuthMiddleware');
const { jwtAuthMiddleware } = require('../middlewares/jwtAuthMiddleware');

const router = express.Router();



router.get('/', getAllPaginatedExams); // Pagination
router.get('/drafts',authorizeRoles, getPaginatedDraftedExams)
router.get('/scheduled', getPaginatedScheduledExams);
router.get('/past', getPaginatedPastExams);
router.get('/live', getPaginatedLiveExams);
router.get('/find/:exam_id', getExamById);
router.post("/student",getExamsForUser)

router.post('/', authorizeRoles, createExam);

router.put('/:exam_id', authorizeRoles, updateExam);
router.put('/publish/:exam_id',authorizeRoles, scheduleExam); // to publish an exam
router.put('/past-exam/:exam_id',authorizeRoles, markPastExam); // to mark an exam as past
router.put('/live-exam/:exam_id',authorizeRoles, markLiveExam); // to mark an exam as past

router.delete('/:exam_id', jwtAuthMiddleware,authorizeRoles, deleteExam);

module.exports = router;