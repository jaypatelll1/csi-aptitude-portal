const teacherResponseModel = require("../models/teacherResponseModel");
const {logActivity} = require("../utils/logActivity");

const deleteExistingTeacherResponses = async (req, res) => {
    const { exam_id } = req.params;
    const teacher_id = req.user.id; // Get teacher ID from JWT
  
    if (!teacher_id || !exam_id) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      // Delete existing responses
      await teacherResponseModel.deleteExistingResponses(exam_id, teacher_id);
  
      // Initialize unanswered questions for teacher
      const response = await teacherResponseModel.submittedUnansweredQuestions(
        exam_id, teacher_id
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
    const { question_id, selected_option, selected_options, text_answer, question_type } = req.body;
    const teacher_id = req.user.id;

    if (!teacher_id || !exam_id || !question_id) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const response = await teacherResponseModel.submitTeacherResponse(
            teacher_id, exam_id, question_id, selected_option, selected_options, text_answer, question_type, 'draft'
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
        
        res.status(201).json({ message: 'Response submitted successfully', response });
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
        const response = await teacherResponseModel.submitFinalTeacherResponsesAndChangeStatus(teacher_id, exam_id);
        
        await logActivity({
            user_id: teacher_id,
            activity: 'Submit Final Responses',
            status: 'success',
            details: 'Final responses submitted successfully',
        });
        
        res.status(201).json({ message: 'Responses submitted successfully', response });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



module.exports = { deleteExistingTeacherResponses ,submitTeacherResponse, submitFinalTeacherResponsesAndChangeStatus};