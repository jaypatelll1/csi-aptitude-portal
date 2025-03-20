const teacherResultModel = require('../models/teacherResultModel');
const { logActivity } = require('../utils/logActivity');
const { viewResult } = require("../utils/viewResult");

// CREATE: Add a new result for teachers
const createResultForTeachers = async (req, res) => {
  const { exam_id, question_id } = req.params;
  const { teacher_id, marks_allotted, max_score, comments } = req.body;

  try {
    const newResult = await teacherResultModel.createResultForTeachers(
      teacher_id,
      exam_id,
      question_id,
      marks_allotted,
      max_score,
      comments,
    );

    if (!newResult) {
      await logActivity({
        user_id: teacher_id,
        activity: 'Create Teacher Result',
        status: 'failure',
        details: 'Could not create result',
      });
      return res.status(400).json({ error: 'Could not create result' });
    }

    await logActivity({
      user_id: teacher_id,
      activity: 'Create Teacher Result',
      status: 'success',
      details: 'Result created successfully',
    });

    res.status(201).json(newResult);
  } catch (err) {
    console.error('Error creating teacher result:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// READ: Get all teacher results
const getAllTeacherResults = async (req, res) => {
  try {
    const results = await teacherResultModel.getAllTeacherResults();
    if (results.length === 0) {
      return res.status(404).json({ error: 'No results found' });
    }
    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching teacher results:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// READ: Get teacher results by teacher_id
const getResultsByTeacher = async (req, res) => {
  const { teacher_id } = req.params;

  try {
    const results = await teacherResultModel.getResultsByTeacher(teacher_id);
    if (!results) {
      return res.status(404).json({ message: 'Results not found.' });
    }
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching teacher results:', error);
    res.status(500).json({ error: error.message });
  }
};

// READ: Get paginated teacher results by exam
const getPaginatedTeacherResultsByExam = async (req, res) => {
  const { exam_id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const results = await teacherResultModel.getPaginatedTeacherResultsByExam(
      exam_id,
      parseInt(page),
      parseInt(limit)
    );

    if (!results) {
      return res.status(404).json({ message: 'Results not found.' });
    }

    res.status(200).json({ page: parseInt(page), limit: parseInt(limit), results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ: Get past teacher results
const pastTeacherResult = async (req, res) => {
  const { exam_id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const response = await viewResult(exam_id, parseInt(page), parseInt(limit));

    if (!response) {
      return res.status(404).json({ message: 'Results not found.' });
    }

    res.status(200).json({ page: parseInt(page), limit: parseInt(limit), response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ: Get a specific teacher result by exam_id and question_id
const getTeacherResultById = async (req, res) => {
  const { exam_id, question_id } = req.params;

  try {
    const result = await teacherResultModel.getTeacherResultById(exam_id, question_id);
    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }
    res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching teacher result:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// UPDATE: Update a teacher result
const updateTeacherResult = async (req, res) => {
  const { exam_id, question_id } = req.params;
  const { teacher_id, marks_allotted, max_score, comments } = req.body;

  try {
    const updatedResult = await teacherResultModel.updateTeacherResult(exam_id, question_id,
      teacher_id,
      marks_allotted,
      max_score,
      comments
    );

    if (!updatedResult) {
      return res.status(404).json({ error: 'Result not found' });
    }

    res.status(200).json(updatedResult);
  } catch (err) {
    console.error('Error updating teacher result:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE: Delete a teacher result
const deleteTeacherResult = async (req, res) => {
  const { exam_id, question_id } = req.params;
  const { teacher_id } = req.body;

  try {
    const deletedResult = await teacherResultModel.deleteTeacherResult(teacher_id, exam_id, question_id);

    if (!deletedResult) {
      return res.status(404).json({ error: 'Result not found' });
    }

    res.status(200).json({ message: 'Result deleted successfully', result: deletedResult });
  } catch (err) {
    console.error('Error deleting teacher result:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get detailed correct/incorrect result
const getCorrectIncorrectForTeacher = async (req, res) => {
  const { exam_id, teacher_id } = req.params;

  try {
    const results = await teacherResultModel.getCorrectIncorrectForTeacher(teacher_id, exam_id);

    if (results.length === 0) {
      return res.status(404).json({ error: 'No results found' });
    }

    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching correct/incorrect results:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createResultForTeachers,
  getAllTeacherResults,
  getResultsByTeacher,
  getPaginatedTeacherResultsByExam,
  pastTeacherResult,
  getTeacherResultById,
  updateTeacherResult,
  deleteTeacherResult,
  getCorrectIncorrectForTeacher,
};
