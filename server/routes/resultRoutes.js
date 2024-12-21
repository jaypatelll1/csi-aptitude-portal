const express = require('express');
const {
  createResult,
  getAllresult,
  getResultById,
  UpdateResult,
  deleteResult,
  getPaginatedResultsByExam,
} = require('../controllers/resultController');
const { authorizeRoles } = require('../middlewares/roleAuthMiddleware');

const router = express.Router();

// CREATE: Add a new result with server-generated completed_at
router.post('/:exam_id', authorizeRoles, createResult);

// READ: Get all results for a particular student
router.get('/', getAllresult);

// READ: Get all results
router.get('/all/:exam_id', authorizeRoles, getPaginatedResultsByExam); // pagination

// READ: Get a specific result by student_ID and exam_id
router.get('/:exam_id', getResultById);

// UPDATE: Update a result
router.put('/:exam_id', authorizeRoles, UpdateResult);

// DELETE: Delete a result
router.delete('/:exam_id', authorizeRoles, deleteResult);

module.exports = router;