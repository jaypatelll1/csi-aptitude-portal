const express = require('express');
const {
  submitResponse,
  getResponsesByStudent,
  getResponsesForExam,
  updateResponse,
  deleteResponse,
} = require('../controllers/responseController');
const { jwtAuthMiddleware } = require('../middlewares/jwtAuthMiddleware');

const router = express.Router();

router.post('/', submitResponse);
router.get('/', getResponsesByStudent);
router
  .all('responses')
  .get('/', getResponsesForExam)
  .put('/:response_id', updateResponse)
  .delete('/:response_id', deleteResponse);

module.exports = router;
