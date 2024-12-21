const {
  submitResponse,
  getResponsesByStudent,
  getResponsesForExam,
  updateResponse,
  deleteResponse,
  submitMultipleResponses,
  getPaginatedResponses
} = require('../models/responseModel');

// Submit a response
exports.submitResponse = async (req, res) => {
  const { exam_id } = req.params;
  const { question_id, selected_option } = req.body;
  const student_id = req.user.id; // Assume the student ID is available via JWT

  try {
    const response = await submitResponse({
      exam_id,
      question_id,
      student_id,
      selected_option,
    });
    res
      .status(201)
      .json({ message: 'Response submitted successfully', response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit all responses together
exports.submitAllResponses = async (req, res) => {
  let { exam_id } = req.params;
  const { responses } = req.body;
  const student_id = req.user.id;
  exam_id = parseInt(exam_id);
  try {
    if (!responses || responses.length === 0) {
      return res.status(400).json({ message: 'No responses provided.' });
    }

    // Add the student_id and exam_id to each response
    const preparedResponses = responses.map((response) => ({
      ...response,
      exam_id,
      student_id,
    }));
    const submittedResponses = await submitMultipleResponses(preparedResponses);

    res.status(201).json({
      message: 'All responses submitted successfully.',
      responses: submittedResponses,
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
    res.status(200).json(responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all responses for an exam (for admin or instructor)
exports.getResponsesForExam = async (req, res) => {
  const { exam_id } = req.params;

  try {
    const responses = await getResponsesForExam(exam_id);
    res.status(200).json(responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a response
exports.updateResponse = async (req, res) => {
  const { response_id } = req.params; // Get the response ID from the route
  const { selected_option } = req.body; // Get the updated answer from the request body

  try {
    const updatedResponse = await updateResponse(response_id, selected_option);

    if (!updatedResponse) {
      return res.status(404).json({ message: 'Response not found.' });
    }

    res
      .status(200)
      .json({ message: 'Response updated successfully.', updatedResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a response
exports.deleteResponse = async (req, res) => {
  const { response_id } = req.params; // Get the response ID from the route

  try {
    const deleted = await deleteResponse(response_id);

    if (!deleted) {
      return res.status(404).json({ message: 'Response not found.' });
    }

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
    res
      .status(200)
      .json({ page: parseInt(page), limit: parseInt(limit), student_id,  responses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};