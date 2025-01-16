const {
  submitResponse,
  getResponsesByStudent,
  getResponsesForExam,
  updateResponse,
  deleteResponse,
  submitMultipleResponses,
  getPaginatedResponses,
  submittedUnansweredQuestions,
} = require('../models/responseModel');
const { logActivity } = require('../utils/logger');

// Submit a response
exports.submitResponse = async (req, res) => {
  const { exam_id } = req.params;
  const { question_id, selected_option } = req.body;
  const student_id = req.user.id; // Assume the student ID is available via JWT

  if (!student_id || !exam_id || !question_id || !selected_option) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const response = await submitResponse({
      exam_id,
      question_id,
      student_id,
      selected_option,
    });
    if (!response) {
      await logActivity({
        user_id: student_id,
        activity: 'Submit Response',
        status: 'failure',
        details: 'Response not submitted',
      });
      return res.status(400).json({ message: 'Response not submitted.' });
    }
    await logActivity({
      user_id: student_id,
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

// responses : {
//   "question_id": number,
//   "selected_option": character;
// }
// Submit all responses together
exports.submitAllResponses = async (req, res) => {
  const { exam_id } = req.params;
  const { responses } = req.body;
  const student_id = req.user.id;

  if (!student_id || !exam_id || !responses) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    if (!responses || responses.length === 0) {
      await logActivity({
        user_id: student_id,
        activity: 'Submit All Responses',
        status: 'failure',
        details: 'No responses provided',
      });
      return res.status(400).json({ message: 'No responses provided.' });
    }

    // Add the student_id and exam_id to each response
    const preparedResponses = responses.map((response) => ({
      ...response,
      exam_id,
      student_id,
    }));
    const submittedResponses = await submitMultipleResponses(preparedResponses);
    const submittedUnansweredResponses = await submittedUnansweredQuestions(
      exam_id,
      student_id
    );

    await logActivity({
      user_id: student_id,
      activity: 'Submit All Responses',
      status: 'success',
      details: 'All responses submitted successfully',
    });
    res.status(201).json({
      message: 'All responses submitted successfully.',
      responses: { submittedResponses, submittedUnansweredResponses },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get responses for a student in an exam
exports.getResponsesByStudent = async (req, res) => {
  const { exam_id } = req.params;
  const student_id = req.user.id; // Assume the student ID is available via JWT

  try {
    const responses = await getResponsesByStudent(exam_id, student_id);
    if (!responses) {
      await logActivity({
        user_id: student_id,
        activity: 'View Responses',
        status: 'failure',
        details: 'Responses not found',
      });
      return res.status(404).json({ message: 'Responses not found.' });
    }
    await logActivity({
      user_id: student_id,
      activity: 'View Responses',
      status: 'success',
      details: 'Responses found',
    });
    res.status(200).json(responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all responses for an exam (for admin or instructor)
exports.getResponsesForExam = async (req, res) => {
  const { exam_id } = req.params;
  const student_id = req.user.id; // Assume the student ID is available via JWT

  try {
    const responses = await getResponsesForExam(exam_id);
    if (!responses) {
      await logActivity({
        user_id: student_id,
        activity: 'View Responses',
        status: 'failure',
        details: 'Responses not found',
      });
      return res.status(404).json({ message: 'Responses not found.' });
    }
    await logActivity({
      user_id: student_id,
      activity: 'View Responses',
      status: 'success',
      details: 'Responses found',
    });
    res.status(200).json(responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a response
exports.updateResponse = async (req, res) => {
  const { response_id } = req.params; // Get the response ID from the route
  const { selected_option } = req.body; // Get the updated answer from the request body
  const student_id = req.user.id; // Assume the student ID is available via JWT

  if (!response_id || !selected_option) {
    return res.status(400).json({ message: 'Selected option is required' });
  }

  try {
    const updatedResponse = await updateResponse(response_id, selected_option);

    if (!updatedResponse) {
      await logActivity({
        user_id: student_id,
        activity: 'Update Response',
        status: 'failure',
        details: 'Response not found',
      });
      return res.status(404).json({ message: 'Response not found.' });
    }
    await logActivity({
      user_id: student_id,
      activity: 'Update Response',
      status: 'success',
      details: 'Response updated successfully',
    });
    await logActivity({
      user_id: student_id,
      activity: 'Update Response',
      status: 'success',
      details: 'Response updated successfully',
    });
    return res
      .status(200)
      .json({ message: 'Response updated successfully.', updatedResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a response
exports.deleteResponse = async (req, res) => {
  const { response_id } = req.params; // Get the response ID from the route
  const student_id = req.user.id; // Assume the student ID is available via JWT

  try {
    const deleted = await deleteResponse(response_id);

    if (!deleted) {
      await logActivity({
        user_id: student_id,
        activity: 'Delete Response',
        status: 'failure',
        details: 'Response not found',
      });
      return res.status(404).json({ message: 'Response not found.' });
    }
    await logActivity({
      user_id: student_id,
      activity: 'Delete Response',
      status: 'success',
      details: 'Response deleted successfully',
    });
    res.status(200).json({ message: 'Response deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Pagination
exports.getPaginatedResponsesForExam = async (req, res) => {
  const { exam_id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const student_id = req.user.id; // Retrieved from JWT
  try {
    const responses = await getPaginatedResponses(
      exam_id,
      student_id,
      parseInt(page),
      parseInt(limit)
    );
    await logActivity({
      user_id: student_id,
      activity: `Viewed paginated responses`,
      status: 'success',
      details: `Page: ${page}, Limit: ${limit}`,
    });
    return res.status(200).json({
      page: parseInt(page),
      limit: parseInt(limit),
      student_id,
      responses,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
