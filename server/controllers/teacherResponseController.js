const teacherResponseModel = require('../models/teacherResponseModel');
const { trackAttempt } = require('../utils/cache');
const { logActivity } = require('../utils/logActivity');

const deleteExistingTeacherResponses = async (req, res) => {
  const { exam_id } = req.params;
  // const teacher_id = req.user.id; // Get teacher ID from JWT
  const teacher_id = req.query.teacher_id;

  if (!teacher_id || !exam_id) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    // Track teacher's attempt
    const attempts = await trackAttempt(teacher_id);
    if (attempts === null) {
      return res.status(500).json({ error: 'Failed to track attempt' });
    } else if(attempts === 2){
      return res.json({ message: `Teacher ${teacher_id} is re-attempting this exam ${exam_id}` });
    } else if(attempts > 2){
      return res.json({ message: `Teacher ${teacher_id} has already re-attempted this exam` });
    }

    // Delete existing responses
    await teacherResponseModel.deleteExistingResponses(exam_id, teacher_id);

    // Initialize unanswered questions for teacher
    const response = await teacherResponseModel.submittedUnansweredQuestions(
      exam_id,
      teacher_id
    );

    await logActivity({
      user_id: teacher_id,
      activity: 'Initialize Responses',
      status: 'success',
      details: 'Responses initialized successfully',
    });

    return res.status(201).json({
      message: 'Responses initialized successfully',
      response,
    });
  } catch (error) {
    console.error('Error initializing responses:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

const submitTeacherResponse = async (req, res) => {
  const { exam_id } = req.params;
  const {
    question_id,
    selected_option,
    selected_options,
    text_answer,
    question_type,
  } = req.body;
  const teacher_id = req.user.id;

  if (!teacher_id || !exam_id || !question_id) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const response = await teacherResponseModel.submitTeacherResponse(
      teacher_id,
      exam_id,
      question_id,
      selected_option,
      selected_options,
      text_answer,
      question_type,
      'draft'
    );

    if (!response) {
      await logActivity({
        user_id: teacher_id,
        activity: 'Submit Response',
        status: 'failure',
        details: 'Response not submitted',
      });
      return res.status(400).json({ message: 'Response not submitted.' });
    }

    await logActivity({
      user_id: teacher_id,
      activity: 'Submit Response',
      status: 'success',
      details: 'Response submitted successfully',
    });

    res
      .status(201)
      .json({ message: 'Response submitted successfully', response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const submitFinalTeacherResponsesAndChangeStatus = async (req, res) => {
  const { exam_id } = req.params;
  const teacher_id = req.user.id;

  if (!teacher_id || !exam_id) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const response =
      await teacherResponseModel.submitFinalTeacherResponsesAndChangeStatus(
        teacher_id,
        exam_id
      );

    await logActivity({
      user_id: teacher_id,
      activity: 'Submit Final Responses',
      status: 'success',
      details: 'Final responses submitted successfully',
    });

    res
      .status(201)
      .json({ message: 'Responses submitted successfully', response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// getResponsesForUsers
const getResponsesForUsers = async (req, res) => {
  const { status } = req.query;
  console.log('status', status);

  const user_id = req.user.id; // Assume the student ID is available via JWT

  try {
    const responses = await teacherResponseModel.getExamIdByResponse(
      status,
      user_id
    );
    if (!responses) {
      await logActivity({
        user_id: user_id,
        activity: 'View Responses',
        status: 'failure',
        details: 'Responses not found',
      });
      return res.status(404).json({ message: 'Responses not found.' });
    }
    await logActivity({
      user_id: user_id,
      activity: 'View Responses',
      status: 'success',
      details: 'Responses found',
    });
    res.status(200).json(responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// getResponsesForUsers
const getAttemptedTest = async (req, res) => {

  const { exam_id } = req.params;
  console.log(exam_id)
  try {
    const responses = await teacherResponseModel.getAttemptedTest( exam_id);
    if (!responses) {
      await logActivity({
        activity: 'View Responses',
        status: 'failure',
        details: 'Responses not found',
      });
      return res.status(404).json({ message: 'Responses not found.' });
    }
    await logActivity({
      activity: 'View Responses',
      status: 'success',
      details: 'Responses found',
    });
    res.status(200).json(responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resetUserResponse = async (req, res) => {
  const { teacherId, examId, questionId } = req.body;

  try {
    if (!teacherId || !examId || !questionId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await teacherResponseModel.clearResponse(
      teacherId,
      examId,
      questionId
    );
    res.json({ message: 'Response cleared successfully', result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteResponse = async (req, res) => {
  const { exam_id } = req.params;
  const teacher_id = req.user?.id; // Extract student ID from JWT or authenticated user data

  if (!teacher_id || !exam_id) {
    return res
      .status(400)
      .json({ message: 'Both exam_id and student_id are required.' });
  }

  try {
    // Delete existing responses
    const deleteResult = await teacherResponseModel.deleteExistingResponses(
      exam_id,
      teacher_id
    );
    console.log('deleteResult:', deleteResult);

    // Check if any rows were deleted
    if (!deleteResult?.deletedRows) {
      // Log the activity for no records found
      await logActivity({
        user_id: teacher_id,
        activity: 'Delete Response',
        status: 'success', // Treat it as success, but with no data deleted
        details:
          'No response found to delete for the given exam_id and student_id.',
      });

      return res.status(200).json({
        message: 'No response found to delete.',
        deletedRows: 0,
      });
    }

    // Log successful deletion
    await logActivity({
      user_id: teacher_id,
      activity: 'Delete Response',
      status: 'success',
      details: `Deleted ${deleteResult.deletedRows} response(s) for exam_id: ${exam_id}.`,
    });

    res.status(200).json({
      message: 'Response deleted successfully.',
      deletedRows: deleteResult.deletedRows,
    });
  } catch (error) {
    console.error('Error deleting response:', error);
    res.status(500).json({
      error:
        'An error occurred while deleting the response. Please try again later.',
    });
  }
};

const getPaginatedResponsesForExam = async (req, res) => {
  const { exam_id } = req.params;
  let { page, limit, teacher_id } = req.query;
  // const teacher_id = req.user.id; // Retrieved from JWT

  try {
    // Convert query params to integers and handle missing values
    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) page = null;
    if (isNaN(limit) || limit < 1) limit = null;

    const responses = await teacherResponseModel.getPaginatedResponses(
      teacher_id,
      exam_id,
      page,
      limit
    );

    // Log activity but ensure it doesn't break execution
    try {
      await logActivity({
        user_id: teacher_id,
        activity: `Viewed paginated responses`,
        status: 'success',
        details: `Page: ${page || 'All'}, Limit: ${limit || 'All'}`,
      });
    } catch (logError) {
      console.error('Error logging activity:', logError);
    }

    return res.status(200).json({
      responses,
    });
  } catch (error) {
    console.error('Error fetching paginated responses:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getAttemptedTeachersForExam = async (req, res) => {
  const { exam_id } = req.params;
  let { page, limit } = req.query;
  const teacher_id = req.user.id; // Retrieved from JWT

  try {
    // Convert query params to integers and handle missing values
    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) page = null;
    if (isNaN(limit) || limit < 1) limit = null;

    const responses = await teacherResponseModel.getAttemptedTeachersForExam(
      exam_id,
      page,
      limit
    );

    // Log activity but ensure it doesn't break execution
    try {
      await logActivity({
        user_id: teacher_id,
        activity: `Viewed paginated users`,
        status: 'success',
        details: `Page: ${page || 'All'}, Limit: ${limit || 'All'}`,
      });
    } catch (logError) {
      console.error('Error logging activity:', logError);
    }
    return res.status(200).json(responses);
  } catch (error) {
    console.error('Error fetching paginated users:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  deleteExistingTeacherResponses,
  submitTeacherResponse,
  submitFinalTeacherResponsesAndChangeStatus,
  getResponsesForUsers,
  resetUserResponse,
  deleteResponse,
  getPaginatedResponsesForExam,
  getAttemptedTeachersForExam,
  getAttemptedTest
};
