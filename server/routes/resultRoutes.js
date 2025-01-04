const express = require('express');
const {
  createResult,
  getAllresult,
  getResultById,
  UpdateResult,
  deleteResult,
  getPaginatedResultsByExam,
  pastResult
} = require('../controllers/resultController');
const { authorizeRoles } = require('../middlewares/roleAuthMiddleware');
const { jwtAuthMiddleware } = require('../middlewares/jwtAuthMiddleware');

const router = express.Router();

// CREATE: Add a new result with server-generated completed_at
// router.post('/',jwtAuthMiddleware, authorizeRoles, createResult);

// READ: Get all results for a particular student
router.get('/student-all',jwtAuthMiddleware, getAllresult);

// READ: Get all results
router.get('/all/:exam_id',jwtAuthMiddleware, authorizeRoles, getPaginatedResultsByExam); // pagination


// imp get result when past test is clicked 
router.get('/allpast/:exam_id',jwtAuthMiddleware, authorizeRoles, pastResult);
// READ: Get a specific result by student_ID and exam_id
router.get('/:exam_id',jwtAuthMiddleware, getResultById);

// UPDATE: Update a result
router.put('/:exam_id',jwtAuthMiddleware, authorizeRoles, UpdateResult);

// DELETE: Delete a result
router.delete('/:exam_id',jwtAuthMiddleware, authorizeRoles, deleteResult);

module.exports = router;