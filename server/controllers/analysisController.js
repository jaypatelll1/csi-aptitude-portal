const analysisModel = require('../models/analysisModel');
const { logActivity } = require('../utils/logActivity');
const { student_analysis } = require('../utils/student_analysis');

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

const generateStudentAnalysisUsingId = async (req, res) => {
  const { student_id, exam_id } = req.params;

  try {
    const anlaysis = await student_analysis(exam_id, student_id);
    if (!anlaysis) {
      await logActivity({
        user_id: student_id,
        activity: 'View anlaysis',
        status: 'failure',
        details: 'anlaysis not found',
      });
      return res.status(404).json({ message: 'anlaysis not found.' });
    }

    await logActivity({
      user_id: student_id,
      activity: 'View anlaysis',
      status: 'success',
      details: 'Results found',
    });
    res.status(200).json({ anlaysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const generateStudentAnalysis = async (req, res) => {
  const result = await analysisModel.generateStudentAnalysis();

  result.map((res) => {
    const { exam_id, student_id } = res;
    student_analysis(exam_id, student_id);
  });
  // console.log(result)
  res.json({
    message: 'Data added successfully in student_analysis table.',
  });
};

const avgResults = async (req, res) => {
  const { student_id } = req.params;

  try {
    const result = await analysisModel.avgResults(student_id);
    if (!result) {
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
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStudentRank = async (req, res) => {
  const student_id = req.user.id;

  try {
    const result = await analysisModel.getStudentRank(student_id);
    if (!result) {
      await logActivity({
        user_id: student_id,
        activity: 'View Student Rank',
        status: 'failure',
        details: 'Student not found',
      });
      return res.status(404).json({ message: 'Student not found.' });
    }

    await logActivity({
      user_id: student_id,
      activity: 'View Student Rank',
      status: 'success',
      details: 'Rank viewed successfully',
    });
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getOverallResultsOfAStudent,
  getResultOfAParticularExam,
  testCompletion,
  generateStudentAnalysis,
  generateStudentAnalysisUsingId,
  avgResults,
  getStudentRank
};
