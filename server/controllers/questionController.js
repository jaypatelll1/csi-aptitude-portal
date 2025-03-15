const questionModel = require('../models/questionModel');
const { logActivity } = require('../utils/logActivity');

const createQuestions = async (req, res) => {
  let {
    question_type,
    question_text,
    options,
    correct_option,
    correct_options,
    category,
    image_url,
  } = req.body;
  const { exam_id } = req.params;
  const id = req.user.id; // Get user_id from token

  if (!exam_id || !question_type || !question_text || !options || !category) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  // Convert category to lowercase and validate it against ENUM values
  const category_type = category.toLowerCase();
  const validCategories = [
    'quantitative aptitude',
    'logical reasoning',
    'verbal ability',
    'technical',
    'general knowledge',
  ];

  if (!validCategories.includes(category_type)) {
    return res.status(400).json({ error: 'Invalid category value' });
  }

  const validQuestionTypes = [
    'single_choice',
    'multiple_choice',
    'text',
    'image',
  ];

  if (!validQuestionTypes.includes(question_type)) {
    return res.status(400).json({ error: 'Invalid question type value' });
  }

  if (correct_options) {
    correct_options =
      correct_options.length > 0 ? JSON.stringify(correct_options) : null;
  }

  if (question_type === 'text') options = null;

  if (image_url === "") image_url = null;

  try {
    const newQuestion = await questionModel.insertQuestion(
      exam_id,
      question_type,
      question_text,
      options,
      correct_option,
      correct_options,
      category_type,
      image_url
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
const getStudentQuestion = async (req, res) => {
  const { exam_id } = req.params;
  const id = req.user.id; // Get user_id from token
  try {
    const questions = await questionModel.getStudentQuestionsByExamId(exam_id);

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

// getStudentQuestion

const UpdateQuestion = async (req, res) => {
  const { question_id, exam_id } = req.params;
  let {
    question_type,
    question_text,
    options,
    correct_option,
    correct_options,
    category,
    image_url,
  } = req.body;
  const id = req.user.id; // Get user_id from token

  if (!exam_id || !question_id || !question_text || !options || !category) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  // Convert category to lowercase and validate it against ENUM values
  const category_type = category.toLowerCase();
  const validCategories = [
    'quantitative aptitude',
    'logical reasoning',
    'verbal ability',
    'technical',
    'general knowledge',
  ];

  if (!validCategories.includes(category_type)) {
    return res.status(400).json({ error: 'Invalid category value' });
  }

  const validQuestionTypes = [
    'single_choice',
    'multiple_choice',
    'text',
    'image',
  ];

  if (!validQuestionTypes.includes(question_type)) {
    return res.status(400).json({ error: 'Invalid question type value' });
  }

  if (correct_options) {
    correct_options =
      correct_options.length > 0 ? JSON.stringify(correct_options) : null;
  }

  if (question_type === 'text') options = null;

  if (image_url === "") image_url = null;
  
  try {
    const questions = await questionModel.UpdateQuestions(
      question_id,
      exam_id,
      question_type,
      question_text,
      options,
      correct_option,
      correct_options,
      category_type,
      image_url
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
  getStudentQuestion,
};
