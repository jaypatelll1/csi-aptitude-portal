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

router.all('/')
  .post('/initialize/:exam_id', deleteExistingResponses)
  .put('/:exam_id',submitResponse) // Submit a single response
  .put('/final/:exam_id', submitFinalResponsesAndChangeStatus)

  .post('/submit-all/:exam_id', submitAllResponses) // Submit all responses together
  .get('/users/:exam_id', getResponsesByStudent) // Get response by student
  .get('/user_id', getResponsesForUsers) // response for particular users 
  .get('/:exam_id', getPaginatedResponsesForExam) // pagination

  .put('/questions/:exam_id/:question_id/:response_id', updateResponse)
  .delete('/questions/:exam_id', deleteResponse);
  router.post("/clear-response", resetUserResponse);

module.exports = router;