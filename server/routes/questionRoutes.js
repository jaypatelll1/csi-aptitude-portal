const express = require('express');
const router = express.Router();
const questionsModel = require('../models/questionModel');
const {createQuestions ,getQuestion,UpdateQuestion,DeleteQuestion}= require("../controllers/questionController");



// Route to create a new question
router.post('/', createQuestions);

// Route to get all questions for a specific exam
router.get('/:exam_id', getQuestion);

// Route to edit a question using question id

router.patch("/:question_id",UpdateQuestion);

// Route to delete a question using question id

router.delete("/:question_id",DeleteQuestion)


module.exports = router;


