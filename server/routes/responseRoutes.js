const express = require('express');
const {
  submitResponse,
  getResponsesByStudent,
  getResponsesForExam,
  updateResponse,
  deleteResponse,
  submitAllResponses,
  getPaginatedResponsesForExam,
  deleteExistingResponses,
  submitFinalResponsesAndChangeStatus,
  getResponsesForUsers,
  resetUserResponse
} = require('../controllers/responseController');


const router = express.Router();

// Rate Limit
// const {limiter} = require("../utils/rateLimitUtils");
// router.use(limiter);


  router.post('/initialize/:exam_id', deleteExistingResponses)
  router.put('/:exam_id',submitResponse) // Submit a single response
  router.put('/final/:exam_id', submitFinalResponsesAndChangeStatus)

  router.post('/submit-all/:exam_id', submitAllResponses) // Submit all responses together
  router.get('/users/:exam_id', getResponsesByStudent) // Get response by student
  router.get('/user_id', getResponsesForUsers) // response for particular users 
  router.get('/:exam_id', getPaginatedResponsesForExam) // pagination

  router.put('/questions/:exam_id/:question_id/:response_id', updateResponse)
  router.delete('/questions/:exam_id', deleteResponse);
  router.put("/exams/clear-response", resetUserResponse);

module.exports = router;