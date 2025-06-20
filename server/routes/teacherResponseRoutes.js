const express = require('express');
const router = express.Router();
const {
  deleteExistingTeacherResponses,
  submitTeacherResponse,
  submitFinalTeacherResponsesAndChangeStatus,
  getResponsesForUsers,
  resetUserResponse,
  deleteResponse,
  getPaginatedResponsesForExam,
  getAttemptedTeachersForExam,
  getAttemptedTest
} = require('../controllers/teacherResponseController');

router.post('/initialize/:exam_id', deleteExistingTeacherResponses);
router.put('/:exam_id', submitTeacherResponse); // Submit a single response
router.put('/final/:exam_id', submitFinalTeacherResponsesAndChangeStatus);
router.get('/president/attempted-test/:exam_id',getAttemptedTest)
router.get('/user_id', getResponsesForUsers); // response for particular users
router.get('/:exam_id', getPaginatedResponsesForExam) // pagination
router.get('/attempted-teachers/:exam_id', getAttemptedTeachersForExam) // pagination

router.put("/exams/clear-response", resetUserResponse);


router.delete('/questions/:exam_id', deleteResponse);

module.exports = router;
