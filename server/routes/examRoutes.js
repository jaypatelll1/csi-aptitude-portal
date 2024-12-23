const express = require('express');
const {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  getAllPaginatedExams,
} = require('../controllers/examController');
const { authorizeRoles } = require('../middlewares/roleAuthMiddleware');
const { jwtAuthMiddleware } = require('../middlewares/jwtAuthMiddleware');

const router = express.Router();

router.post('/',jwtAuthMiddleware, authorizeRoles, createExam);
router.get('/',jwtAuthMiddleware, getAllPaginatedExams); // Pagination
router.get('/:exam_id',jwtAuthMiddleware,authorizeRoles, getExamById);
router.put('/:exam_id',jwtAuthMiddleware, authorizeRoles, updateExam);
router.delete('/:exam_id', jwtAuthMiddleware,authorizeRoles, deleteExam);

module.exports = router;