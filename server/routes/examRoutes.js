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

const router = express.Router();

router.post('/', authorizeRoles, createExam);
router.get('/', getAllPaginatedExams); // Pagination
router.get('/:exam_id', getExamById);
router.put('/:exam_id', authorizeRoles, updateExam);
router.delete('/:exam_id', authorizeRoles, deleteExam);

module.exports = router;