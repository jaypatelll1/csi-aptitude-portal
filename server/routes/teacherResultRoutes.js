const express = require('express');
const {
  createResultForTeachers,
  getAllTeacherResults,
  getTeacherResultById,
  updateTeacherResult,
  deleteTeacherResult,
  getPaginatedTeacherResultsByExam,
  pastTeacherResult,
  getResultsByTeacher,
  getCorrectIncorrectForTeacher
} = require('../controllers/teacherResultController');
const { authorizeRoles } = require('../middlewares/roleAuthMiddleware');

const router = express.Router();

// Rate Limit
const { limiter } = require('../middlewares/rateLimitMiddleware');

// CREATE: Add a new result for teachers
router.post('/create-result/:exam_id/:question_id', createResultForTeachers);

// READ: Get all results for a particular teacher
router.get('/teacher-all', getAllTeacherResults);
router.get('/teacher/:teacher_id', getResultsByTeacher);

// READ: Get paginated results for an exam
router.get('/all/:exam_id', authorizeRoles, getPaginatedTeacherResultsByExam);

// Get past results when a test is clicked
router.get('/allpast/:exam_id', authorizeRoles, pastTeacherResult);

// READ: Get a specific result by teacher_id, exam_id, and question_id
router.get('/:exam_id/:question_id', getTeacherResultById);

// UPDATE: Update a result
router.put('/:exam_id/:question_id', authorizeRoles, updateTeacherResult);

// DELETE: Delete a result
router.delete('/:exam_id/:question_id', authorizeRoles, deleteTeacherResult);

// Get detailed result (correct/incorrect)
router.get('/correct-incorrect/:exam_id/:question_id/:teacher_id', getCorrectIncorrectForTeacher);

module.exports = router;
