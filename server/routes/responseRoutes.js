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

const router = express.Router();

router
  .all('/')
  .post('/:exam_id', submitResponse) // Submit a single response
  .post('/submit-all/:exam_id', submitAllResponses) // Submit all responses together
  .get('/users/:exam_id', getResponsesByStudent) // Get response by student
  
  .get('/:exam_id', getPaginatedResponsesForExam) // pagination

  .put('/questions/:exam_id/:question_id/:response_id', updateResponse)
  .delete('/questions/:exam_id/:question_id/:response_id', deleteResponse);

module.exports = router;