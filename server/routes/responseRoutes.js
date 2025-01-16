const express = require('express');
const {
  submitResponse,
  getResponsesByStudent,
  getResponsesForExam,
  updateResponse,
  deleteResponse,
  submitAllResponses,
  getPaginatedResponsesForExam,
} = require('../controllers/responseController');
const { jwtAuthMiddleware } = require('../middlewares/jwtAuthMiddleware');

const router = express.Router();

router.all('/')
  .post('/:exam_id',jwtAuthMiddleware, submitResponse) // Submit a single response
  .post('/submit-all/:exam_id',jwtAuthMiddleware, submitAllResponses) // Submit all responses together
  .get('/users/:exam_id',jwtAuthMiddleware, getResponsesByStudent) // Get response by student
  
  .get('/:exam_id',jwtAuthMiddleware, getPaginatedResponsesForExam) // pagination

  .put('/questions/:exam_id/:question_id/:response_id',jwtAuthMiddleware, updateResponse)
  .delete('/questions/:exam_id/:question_id/:response_id',jwtAuthMiddleware, deleteResponse);

module.exports = router;