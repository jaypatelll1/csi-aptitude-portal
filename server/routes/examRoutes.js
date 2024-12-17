const express = require("express");
const {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
} = require("../controllers/examController");

const router = express.Router();

router.post("/", createExam);
router.get("/", getExams);
router.get("/:exam_id", getExamById);
router.put("/:exam_id", updateExam);
router.delete("/:exam_id", deleteExam);

module.exports = router;
