const express = require("express");
const {
  createExam,
  getExams,
  updateExam,
  deleteExam,
} = require("../controllers/examController");

const router = express.Router();

router.post("/", createExam);
router.get("/", getExams);
router.put("/:exam_id", updateExam);
router.delete("/:exam_id", deleteExam);

module.exports = router;
