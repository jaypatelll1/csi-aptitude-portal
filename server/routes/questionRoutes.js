const express = require('express');
const {
  createQuestions,
  getQuestion,
  UpdateQuestion,
  DeleteQuestion,
  getPaginatedQuestionsByExam,
  getQuestionCount
} = require('../controllers/questionController');
const { authorizeRoles } = require('../middlewares/roleAuthMiddleware');
const { jwtAuthMiddleware } = require('../middlewares/jwtAuthMiddleware');

const router = express.Router();

// Route to create a new question
router.post('/:exam_id', jwtAuthMiddleware,authorizeRoles, createQuestions);

// Route to get all questions for a specific exam
// router.get('/:exam_id', jwtAuthMiddleware, getPaginatedQuestionsByExam); 
router.get('/:exam_id', jwtAuthMiddleware, getQuestion); 

router.get('/count/:exam_id', jwtAuthMiddleware, getQuestionCount); 

// Route to edit a question using question id
router.put('/:exam_id/:question_id',jwtAuthMiddleware,authorizeRoles, UpdateQuestion);

// Route to delete a question using question id
router.delete('/:exam_id/:question_id', jwtAuthMiddleware,authorizeRoles, DeleteQuestion);

module.exports = router;