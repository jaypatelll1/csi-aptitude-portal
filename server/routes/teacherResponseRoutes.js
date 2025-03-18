const express = require("express");
const router = express.Router();
const teacherResponseController = require("../controllers/teacherResponseController");

router.post('/initialize/:exam_id', teacherResponseController.deleteExistingTeacherResponses);
router.put('/:exam_id', teacherResponseController.submitTeacherResponse); // Submit a single response
router.put('/final/:exam_id', teacherResponseController.submitFinalTeacherResponsesAndChangeStatus);


module.exports = router;