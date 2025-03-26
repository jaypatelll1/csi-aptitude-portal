const express = require('express');
const {
  updateResultForTeachers,
  getAllTeacherResults,
  getTeacherResultById,
  updateTeacherResult,
  deleteTeacherResult,
  getPaginatedTeacherResultsByExam,
  getResultsByTeacher,
  getCorrectIncorrectForTeacher,
  initializeResultForTeachers
} = require('../controllers/teacherResultController');
const { authorizeRoles } = require('../middlewares/roleAuthMiddleware');

const router = express.Router();

// Rate Limit
const { limiter } = require('../middlewares/rateLimitMiddleware');

// CREATE: Add a new result for teachers
router.put('/update-result/:exam_id/:question_id', updateResultForTeachers);
router.post('/initialize-result/:exam_id', initializeResultForTeachers);

// READ: Get all results for a particular teacher
router.get('/teacher-all', getAllTeacherResults);
router.get('/teacher/:teacher_id', getResultsByTeacher);

// READ: Get paginated results for an exam
router.get('/all/:exam_id', authorizeRoles, getPaginatedTeacherResultsByExam);

// READ: Get a specific result by teacher_id, exam_id, and question_id
router.get('/:exam_id', getTeacherResultById);

// UPDATE: Update a result
router.put('/:exam_id/:question_id', authorizeRoles, updateTeacherResult);

// DELETE: Delete a result
router.delete('/:exam_id/:question_id', authorizeRoles, deleteTeacherResult);

// Get detailed result (correct/incorrect)
router.get('/correct-incorrect/:exam_id/:teacher_id', getCorrectIncorrectForTeacher);

module.exports = router;
