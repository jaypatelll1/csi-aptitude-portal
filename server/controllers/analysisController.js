const analysisModel = require('../models/analysisModel');
const { logActivity } = require('../utils/logActivity');

const getOverallResultsOfAStudent = async (req, res) => {
  const { student_id } = req.params;

  try {
    const results = await analysisModel.getOverallResultsOfAStudent(student_id);
    if (!results) {
      await logActivity({
        user_id: student_id,
        activity: 'View overall Results',
        status: 'failure',
        details: 'Results not found',
      });
      return res.status(404).json({ message: 'Results not found.' });
    }
    await logActivity({
      user_id: student_id,
      activity: 'View overall Results',
      status: 'success',
      details: 'Results found',
    });
    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getResultOfAParticularExam = async (req, res) => {
  const { student_id, exam_id } = req.params;

  try {
    const results = await analysisModel.getResultOfAParticularExam(
      student_id,
      exam_id
    );
    if (!results) {
      await logActivity({
        user_id: student_id,
        activity: 'View Particular Exam Results',
        status: 'failure',
        details: 'Results not found',
      });
      return res.status(404).json({ message: 'Results not found.' });
    }

    await logActivity({
      user_id: student_id,
      activity: 'View Particular Exam Results',
      status: 'success',
      details: 'Results found',
    });
    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const testCompletion = async (req, res) => {
  const { student_id } = req.params;

  try {
    const exams = await analysisModel.testCompletion(student_id);
    if (!exams) {
      await logActivity({
        user_id: student_id,
        activity: 'View No. of Exam Attempted',
        status: 'failure',
        details: 'Results not found',
      });
      return res.status(404).json({ message: 'Results not found.' });
    }

    await logActivity({
      user_id: student_id,
      activity: 'View No. of Exam Attempted',
      status: 'success',
      details: 'Results found',
    });
    res.status(200).json({ exams });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getOverallResultsOfAStudent,
  getResultOfAParticularExam,
  testCompletion,
};
