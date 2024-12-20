const express = require('express');
const {
  createResult,
  getAllresult,
  getResultById,
  UpdateResult,
  deleteResult,
} = require('../controllers/resultController');
const { authorizeRoles } = require('../middlewares/roleAuthMiddleware');

const router = express.Router();

// CREATE: Add a new result with server-generated completed_at
router.post('/', authorizeRoles, createResult);

// READ: Get all results
router.get('/all', getAllresult);

// READ: Get a specific result by student_ID and exam_id
router.get('/', getResultById);

// UPDATE: Update a result
router.put('/', authorizeRoles, UpdateResult);

// DELETE: Delete a result
router.delete('/', authorizeRoles, deleteResult);

module.exports = router;
