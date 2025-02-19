const express = require('express');
const {
  createResult,
  getAllresult,
  getResultById,
  UpdateResult,
  deleteResult,
  getPaginatedResultsByExam,
  pastResult,
  getResultsByUsers,
  getCorrectIncorrect
} = require('../controllers/resultController');
const { authorizeRoles } = require('../middlewares/roleAuthMiddleware');
const { jwtAuthMiddleware } = require('../middlewares/jwtAuthMiddleware');

const router = express.Router();

// CREATE: Add a new result with server-generated completed_at
// router.post('/',jwtAuthMiddleware, authorizeRoles, createResult);

// READ: Get all results for a particular student
router.get('/student-all', getAllresult);

// READ: Get all results
router.get('/all/:exam_id', authorizeRoles, getPaginatedResultsByExam); // pagination
router.get("/student/:user_id", getResultsByUsers)

// imp get result when past test is clicked 
router.get('/allpast/:exam_id', authorizeRoles, pastResult);
// READ: Get a specific result by student_ID and exam_id
router.get('/:exam_id', getResultById);

// UPDATE: Update a result
router.put('/:exam_id', authorizeRoles, UpdateResult);

// DELETE: Delete a result
router.delete('/:exam_id', authorizeRoles, deleteResult);

//Get Detailed Result:
router.get('/correct-incorrect/:exam_id/:student_id', getCorrectIncorrect);

module.exports = router;