const questionModel = require('../models/questionModel');
const { logActivity } = require('../utils/logActivity');

const createQuestions = async (req, res) => {
  const { question_text, options, correct_option } = req.body;
  const { exam_id } = req.params;
  const id = req.user.id; // Get user_id from token

  if (!exam_id || !question_text || !options || !correct_option) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const newQuestion = await questionModel.insertQuestion(
      exam_id,
      question_text,
      options,
      correct_option
    );
    if (!newQuestion) {
      await logActivity({
        user_id: id,
        activity: 'Create Question',
        status: 'failure',
        details: 'Could not create new question',
      });
      return res.status(500).json({
        error: 'Server Error',
        message: 'Could not create question',
      });
    }
    await logActivity({
      user_id: id,
      activity: 'Create Question',
      status: 'success',
      details: 'New Question created successfully',
    });
    res.status(201).json(newQuestion); // Return the created question
  } catch (error) {
    res.status(500).json({ message: 'Error creating question', error });
  }
};

const getQuestion = async (req, res) => {
  const { exam_id } = req.params;
  const id = req.user.id; // Get user_id from token
  try {
    const questions = await questionModel.getQuestionsByExamId(exam_id);

    if (!questions) {
      await logActivity({
        user_id: id,
        activity: 'View Question',
        status: 'failure',
        details: 'No Questions found',
      });
      return res.status(404).json({
        error: ' Not Found',
        message: 'Resource not Found',
      });
    }
    await logActivity({
      user_id: id,
      activity: 'View Question',
      status: 'success',
      details: 'View Questions successfully',
    });
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error });
  }
};

const UpdateQuestion = async (req, res) => {
  const { question_id, exam_id } = req.params;
  const { question_text, options, correct_option } = req.body;
  const id = req.user.id; // Get user_id from token
  try {
    const questions = await questionModel.UpdateQuestions(
      question_id,
      exam_id,
      question_text,
      options,
      correct_option
    );

    if (!questions) {
      await logActivity({
        user_id: id,
        activity: 'Update Question',
        status: 'failure',
        details: 'Could not update question',
      });
      return res.status(404).json({
        error: ' Not Found',
        message: 'Resource not Found',
      });
    }

    await logActivity({
      user_id: id,
      activity: 'Update Question',
      status: 'success',
      details: 'Question updated successfully',
    });
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error });
  }
};

const DeleteQuestion = async (req, res) => {
  const { question_id } = req.params;
  const id = req.user.id; // Get user_id from token
  try {
    const questions = await questionModel.DeleteQuestions(question_id);
    if (!questions) {
      await logActivity({
        user_id: id,
        activity: 'Delete Question',
        status: 'failure',
        details: 'Could not delete question',
      });
      return res.status(404).json({
        error: 'Not Found',
        message: 'Resource not Found',
      });
    }
    await logActivity({
      user_id: id,
      activity: 'Delete Question',
      status: 'success',
      details: 'Question deleted successfully',
    });
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error });
  }
};


const getQuestionCount = async (req, res) => {
  const { exam_id } = req.params;

  try {
    // Assuming questionModel.GetViewResult is a function that fetches the question count
    const question = await questionModel.GetViewResult(exam_id);

    // Respond with the question count
    return res.status(200).json({ question });
  } catch (error) {
    console.error("Error fetching question count:", error.message);

    // Handle errors gracefully
    return res.status(500).json({ error: error.message });
  }
};




// Pagination
const getPaginatedQuestionsByExam = async (req, res) => {
  const user_id = req.user.id;
  const { exam_id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  try {
    const questions = await questionModel.getPaginatedQuestionsByExam(
      parseInt(exam_id),
      parseInt(page),
      parseInt(limit)
    );
    await logActivity({
      user_id,
      activity: `Viewed paginated questions`,
      status: 'success',
      details: `Page: ${page}, Limit: ${limit}`,
    });
    return res
      .status(200)
      .json({ page: parseInt(page), limit: parseInt(limit), questions });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createQuestions,
  getQuestion,
  UpdateQuestion,
  DeleteQuestion,
  getPaginatedQuestionsByExam,
  getQuestionCount
};