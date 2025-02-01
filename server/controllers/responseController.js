const responseModel = require('../models/responseModel');
const { logActivity } = require('../utils/logActivity');

// Delete Exististing responses and initialize responses
const deleteExistingResponses = async (req, res) => {
  const { exam_id } = req.params;
  const student_id = req.user.id; // Assume the student ID is available via JWT

  if (!student_id || !exam_id) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  try {
    // Delete existing responses
    // const deleteResult = await responseModel.deleteExistingResponses(exam_id, student_id);
    // console.log('deleteResult:', deleteResult);
  
    // Initialize unanswered questions
    const response = await responseModel.submittedUnansweredQuestions(exam_id, student_id);
    // console.log('Initialized unanswered questions:', response);
  
    return res.status(201).json({
      message: 'Responses initialized successfully',
     
      response,
    });
  } catch (error) {
    console.error('Error in response initialization:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
// Submit a response
const submitResponse = async (req, res) => {
  const { exam_id } = req.params;
  const { question_id, selected_option } = req.body;
  const student_id = req.user.id; // Assume the student ID is available via JWT

  if (!student_id || !exam_id || !question_id || !selected_option) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const response = await responseModel.submitResponse(
      student_id,
      exam_id,
      question_id,
      selected_option,
      'draft'
    );
    // console.log(response);
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

const submitFinalResponsesAndChangeStatus = async (req, res) => {
  const { exam_id } = req.params;
  const student_id = req.user.id; // Assume the student ID is available via JWT

  if (!student_id || !exam_id) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const response = await responseModel.submitFinalResponsesAndChangeStatus(
      student_id,
      exam_id
    );
    
    res
      .status(201)
      .json({ message: 'Responses submitted successfully', response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// responses : {
//   "question_id": number,
//   "selected_option": character;
// }
// Submit all responses together
const submitAllResponses = async (req, res) => {
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
    const submittedResponses =
      await responseModel.submitMultipleResponses(preparedResponses);
    const submittedUnansweredResponses =
      await responseModel.submittedUnansweredQuestions(exam_id, student_id);

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
const getResponsesByStudent = async (req, res) => {
  const { exam_id } = req.params;
  const student_id = req.user.id; // Assume the student ID is available via JWT

  try {
    const responses = await responseModel.getResponsesByStudent(
      exam_id,
      student_id
    );
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
// getResponsesForUsers
const getResponsesForUsers = async (req, res) => {
  const {status}= req.query ;
  console.log('status',status);
  
  const user_id = req.user.id; // Assume the student ID is available via JWT

  try {
    const responses = await responseModel.getExamIdByResponse(status,
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



// Get all responses for an exam (for admin or instructor)
const getResponsesForExam = async (req, res) => {
  const { exam_id } = req.params;
  const student_id = req.user.id; // Assume the student ID is available via JWT

  try {
    const responses = await responseModel.getResponsesForExam(exam_id);
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
const updateResponse = async (req, res) => {
  const { response_id } = req.params; // Get the response ID from the route
  const { selected_option } = req.body; // Get the updated answer from the request body
  const student_id = req.user.id; // Assume the student ID is available via JWT

  if (!response_id || !selected_option) {
    return res.status(400).json({ message: 'Selected option is required' });
  }

  try {
    const updatedResponse = await responseModel.updateResponse(
      response_id,
      selected_option
    );

    if (!updatedResponse) {
      await logActivity({
        user_id: student_id,
        activity: 'Update Response',
        status: 'failure',
        details: 'Response not found',
      });
      return res.status(400).json({ message: 'Response not found.' });
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

const deleteResponse = async (req, res) => {
  const { exam_id } = req.params;
  const student_id = req.user?.id; // Extract student ID from JWT or authenticated user data

  if (!student_id || !exam_id) {
    return res.status(400).json({ message: 'Both exam_id and student_id are required.' });
  }

  try {
    // Delete existing responses
    const deleteResult = await responseModel.deleteExistingResponses(exam_id, student_id);
    console.log('deleteResult:', deleteResult);

    // Check if any rows were deleted
    if (!deleteResult?.deletedRows) {
      // Log the activity for no records found
      await logActivity({
        user_id: student_id,
        activity: 'Delete Response',
        status: 'success', // Treat it as success, but with no data deleted
        details: 'No response found to delete for the given exam_id and student_id.',
      });

      return res.status(200).json({
        message: 'No response found to delete.',
        deletedRows: 0,
      });
    }

    // Log successful deletion
    await logActivity({
      user_id: student_id,
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
    res.status(500).json({ error: 'An error occurred while deleting the response. Please try again later.' });
  }
};


const getPaginatedResponsesForExam = async (req, res) => {
  const { exam_id } = req.params;
  let { page, limit } = req.query;
  const student_id = req.user.id; // Retrieved from JWT

  try {
    // Convert query params to integers and handle missing values
    page = parseInt(page);
    limit = parseInt(limit);
    
    if (isNaN(page) || page < 1) page = null;
    if (isNaN(limit) || limit < 1) limit = null;

    const responses = await responseModel.getPaginatedResponses(
      exam_id,
      student_id,
      page,
      limit
    );

    // Log activity but ensure it doesn't break execution
    try {
      await logActivity({
        user_id: student_id,
        activity: `Viewed paginated responses`,
        status: 'success',
        details: `Page: ${page || "All"}, Limit: ${limit || "All"}`,
      });
    } catch (logError) {
      console.error("Error logging activity:", logError);
    }

    return res.status(200).json({
      page: page || "All",
      limit: limit || "All",
      student_id,
      responses,
    });

  } catch (error) {
    console.error("Error fetching paginated responses:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  submitResponse,
  getResponsesByStudent,
  getResponsesForExam,
  updateResponse,
  deleteResponse,
  submitAllResponses,
  getPaginatedResponsesForExam,
  deleteExistingResponses,
  submitFinalResponsesAndChangeStatus,
  getResponsesForUsers
};