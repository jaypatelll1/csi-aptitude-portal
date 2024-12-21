const questionModel = require('../models/questionModel');

const createQuestions = async (req, res) => {
  const { question_text, options, correct_option } = req.body;
  const { exam_id } = req.params;

  try {
    const newQuestion = await questionModel.insertQuestion(
      exam_id,
      question_text,
      options,
      correct_option
    );
    if (!newQuestion) {
      return res.status(500).json({
        error: 'Server Error',
        message: 'Could not create question',
      });
    }
    res.status(201).json(newQuestion); // Return the created question
  } catch (error) {
    res.status(500).json({ message: 'Error creating question', error });
  }
};

const getQuestion = async (req, res) => {
  const { exam_id } = req.params;

  try {
    const questions = await questionModel.getQuestionsByExamId(exam_id);

    if (!questions) {
      return res.status(404).json({
        error: ' Not Found',
        message: 'Resource not Found',
      });
    }
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error });
  }
};

const UpdateQuestion = async (req, res) => {
  const { question_id } = req.params;
  const { exam_id, question_text, options, correct_option } = req.body;
  try {
    const questions = await questionModel.UpdateQuestions(
      question_id,
      exam_id,
      question_text,
      options,
      correct_option
    );

    if (!questions) {
      return res.status(404).json({
        error: ' Not Found',
        message: 'Resource not Found',
      });
    }

    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error });
  }
};

const DeleteQuestion = async (req, res) => {
  const { question_id } = req.params;
  try {
    const questions = await questionModel.DeleteQuestions(question_id);
    res.status(200).json(questions);
    if (!questions) {
      return res.status(404).json({
        error: ' Not Found',
        message: 'Resource not Found',
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error });
  }
};

// Pagination
const getPaginatedQuestionsByExam = async (req, res) => {
  const { exam_id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  try {
    const questions = await questionModel.getPaginatedQuestionsByExam(
      parseInt(exam_id),
      parseInt(page),
      parseInt(limit)
    );
    res
      .status(200)
      .json({ page: parseInt(page), limit: parseInt(limit), questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createQuestions,
  getQuestion,
  UpdateQuestion,
  DeleteQuestion,
  getPaginatedQuestionsByExam
};