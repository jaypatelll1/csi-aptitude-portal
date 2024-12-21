const express = require('express');
const {
  createQuestions,
  getQuestion,
  UpdateQuestion,
  DeleteQuestion,
  getPaginatedQuestionsByExam,
} = require('../controllers/questionController');
const { authorizeRoles } = require('../middlewares/roleAuthMiddleware');

const router = express.Router();

// Route to create a new question
router.post('/:exam_id', authorizeRoles, createQuestions);

// Route to get all questions for a specific exam
router.get('/:exam_id', getPaginatedQuestionsByExam); // pagination

// Route to edit a question using question id
router.patch('/:exam_id/:question_id', authorizeRoles, UpdateQuestion);

// Route to delete a question using question id
router.delete('/:exam_id/:question_id', authorizeRoles, DeleteQuestion);

module.exports = router;