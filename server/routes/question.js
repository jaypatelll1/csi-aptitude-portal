const express = require('express');
const router = express.Router();
const questionsModel = require('../models/questionModel');




// Route to create a new question
router.post('/', async (req, res) => {
  const { question_id,exam_id, question_text, options, correct_option } = req.body;
  console.log('req ',req.body);
  

  try {
    const newQuestion = await questionsModel.insertQuestion(question_id,exam_id, question_text, options, correct_option);
    res.status(201).json(newQuestion); // Return the created question
  } catch (error) {
    res.status(500).json({ message: 'Error creating question', error });
  }
});

// Route to get all questions for a specific exam
router.get('/:exam_id', async (req, res) => {

  const {exam_id} = req.params;
console.log('examid is',exam_id);
console.log('examid is',req.params);

  try {
    const questions = await questionsModel.getQuestionsByExamId(exam_id);
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error });
  }
});

router.patch("/:question_id",async (req,res) => {
  const {question_id} =req.params ;
  console.log('question_id',question_id);
  const { exam_id, question_text, options, correct_option } = req.body;
  try {
    const questions = await questionsModel.UpdateQuestions(question_id,exam_id, question_text, options, correct_option);
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error });
  }
}
);

router.delete("/:question_id",async (req,res) => {
  const {question_id} =req.params ;
  console.log('question_id',question_id);
  try {
    const questions = await questionsModel.DeleteQuestions(question_id);
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error });
  }
}
)


module.exports = router;


