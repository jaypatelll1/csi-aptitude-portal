const express = require('express');
const {
  createQuestions,
  getQuestion,
  UpdateQuestion,
  DeleteQuestion,
} = require('../controllers/questionController');
const { authorizeRoles } = require('../middlewares/roleAuthMiddleware');

const router = express.Router();

// Route to create a new question
router.post('/', authorizeRoles, createQuestions);

// Route to get all questions for a specific exam
router.get('/', getQuestion);

// Route to edit a question using question id
router.patch('/:question_id', authorizeRoles, UpdateQuestion);

// Route to delete a question using question id
router.delete('/:question_id', authorizeRoles, DeleteQuestion);

module.exports = router;
