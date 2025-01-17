const { getLastExam } = require('../models/examModel');
const { logActivity } = require('../utils/logActivity');
const pool = require('../config/db');

const getLastExamStats = async (req, res) => {
  const user_id = req.user.id;

  try {
    const lastExam = await getLastExam();
    if (!lastExam) {
      await logActivity({
        user_id,
        activity: 'Get Last Exam Stats',
        status: 'failure',
        details: 'No last exam found',
      });
      return res.status(404).json({ error: 'No last exam found' });
    }

    const studentCount = await getStudentCountForExam(lastExam.exam_id);

    await logActivity({
      user_id,
      activity: 'Get Last Exam Stats',
      status: 'success',
      details: 'Last exam stats fetched successfully',
    });

    return res.status(200).json({
      examDetails: lastExam,
      studentCount
    });
  } catch (err) {
    console.error('Error fetching last exam stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getStudentCountForExam = async (exam_id) => {
  const query = 'SELECT COUNT(*) FROM responses WHERE exam_id = $1';
  const values = [exam_id];
  const result = await pool.query(query, values);
  return parseInt(result.rows[0].count, 10);
};

const getAllTestsStats = async (req, res) => {
  const user_id = req.user.id;

  try {
    const liveTestsQuery = 'SELECT COUNT(*) FROM exams WHERE status = $1';
    const scheduledTestsQuery = 'SELECT COUNT(*) FROM exams WHERE status = $1';
    const liveTestsResult = await pool.query(liveTestsQuery, ['live']);
    const scheduledTestsResult = await pool.query(scheduledTestsQuery, ['scheduled']);

    const liveTestsCount = parseInt(liveTestsResult.rows[0].count, 10);
    const scheduledTestsCount = parseInt(scheduledTestsResult.rows[0].count, 10);

    await logActivity({
      user_id,
      activity: 'Get All Tests Stats',
      status: 'success',
      details: 'All tests stats fetched successfully',
    });

    return res.status(200).json({
      liveTestsCount,
      scheduledTestsCount
    });
  } catch (err) {
    console.error('Error fetching all tests stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllStudentsStats = async (req, res) => {
  const user_id = req.user.id;

  try {
    const totalStudentsQuery = 'SELECT COUNT(*) FROM users WHERE role = $1 AND status = $2';
    const totalStudentsResult = await pool.query(totalStudentsQuery, ['Student', 'ACTIVE']);

    const totalStudentsCount = parseInt(totalStudentsResult.rows[0].count, 10);

    await logActivity({
      user_id,
      activity: 'Get All Students Stats',
      status: 'success',
      details: 'All students stats fetched successfully',
    });

    return res.status(200).json({
      totalStudentsCount
    });
  } catch (err) {
    console.error('Error fetching all students stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getLastExamStats, getAllTestsStats, getAllStudentsStats };