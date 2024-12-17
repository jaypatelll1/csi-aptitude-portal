const {
  submitResponse,
  getResponsesByStudent,
  getResponsesForExam,
  updateResponse,
  deleteResponse
} = require('../models/responseModel');

// Submit a response
exports.submitResponse = async (req, res) => {
  const { exam_id, question_id, selected_option } = req.body;
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
  
      res.status(200).json({ message: 'Response updated successfully.', updatedResponse });
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
