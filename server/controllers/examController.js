const examModel = require('../models/examModel');

const createExam = async (req, res) => {
  const { name, duration, start_time, end_time } = req.body;
  console.log(req.user)
  const created_by = req.user.id; // Get user_id from token
  const newExam = await examModel.createExam({
    name,
    duration,
    start_time,
    end_time,
    created_by,
  });
  if (!newExam) {
    return res.status(500).json({
      error: 'Server Error',
      message: 'Could not create exam',
    });
  }
  res.status(201).json({
    message: 'Exam created successfully',
    newExam,
  });
};

const getExams = async (req, res) => {
  const exams = await examModel.getExams();
  if (exams.length == 0) {
    return res.json({
      message: 'No Exams found',
    });
  }
  return res.json(exams);
};

const getExamById = async (req, res) => {
  const { exam_id } = req.params;

  try {
    const exam = await examModel.getExamById(exam_id);

    if (!exam) return res.status(404).json({ message: 'Exam not found.' });

    res.status(200).json({ exam });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateExam = async (req, res) => {
  const { exam_id } = req.params;
  const { name, duration, start_time, end_time } = req.body;
  const created_by = req.user.id;
  const updatedExam = await examModel.updateExam({
    exam_id,
    name,
    duration,
    start_time,
    end_time,
    created_by,
  });
  if (!updatedExam) {
    return res.json({
      message: 'Could not update Exam details',
    });
  }
  res.status(201).json({
    message: 'Exam details updated successfully',
    updatedExam,
  });
};

const deleteExam = async (req, res) => {
  const { exam_id } = req.params;
  const deletedExam = await examModel.deleteExam({ exam_id });
  if (!deletedExam) {
    return res.status(400).json({
      message: 'Exam details Not Found',
    });
  }
  res.status(200).json({
    message: 'Exam deleted successfully',
    deletedExam,
  });
};

module.exports = { createExam, getExams, getExamById, updateExam, deleteExam };
