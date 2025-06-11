const { getLastExam } = require('../models/examModel');
const { logActivity } = require('../utils/logActivity');
const pool = require('../config/db');

const getLastExamStats = async (req, res) => {
  const user_id = req.user.id;
  const exam_for = req.query.exam_for;

  try {
    const lastExam = await getLastExam(exam_for);
    if (!lastExam) {
      await logActivity({
        user_id,
        activity: 'Get Last Exam Stats',
        status: 'failure',
        details: 'No last exam found',
      });
      return res.status(404).json({ error: 'No last exam found' });
    }

    const studentCount = await getStudentCountForExam(lastExam.exam_id, lastExam.exam_for);

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

const getStudentCountForExam = async (exam_id, exam_for) => {
  let query;
  if(exam_for === 'Student') {
    query = 'SELECT COUNT(*) FROM responses WHERE exam_id = $1';
  }
  else if(exam_for === 'Teacher') {
    query = 'SELECT COUNT(*) FROM teacher_responses WHERE exam_id = $1';
  }
  const values = [exam_id];
  const result = await pool.query(query, values);
  return parseInt(result.rows[0].count, 10);
};

const getAllTestsStats = async (req, res) => {
  const user_id = req.user.id;
  const { exam_for } = req.query;

  try {
    const liveTestsQuery = 'SELECT COUNT(*) FROM exams WHERE status = $1 AND exam_for=$2';
    const scheduledTestsQuery = 'SELECT COUNT(*) FROM exams WHERE status = $1 AND exam_for=$2';
    const liveTestsResult = await pool.query(liveTestsQuery, ['live', exam_for]);
    const scheduledTestsResult = await pool.query(scheduledTestsQuery, ['scheduled', exam_for]);
    const pastTestsResult = await pool.query(scheduledTestsQuery, ['past', exam_for]);

    const liveTestsCount = parseInt(liveTestsResult.rows[0].count, 10);
    const scheduledTestsCount = parseInt(scheduledTestsResult.rows[0].count, 10);
    const pastTestsCount = parseInt(pastTestsResult.rows[0].count, 10);

    await logActivity({
      user_id,
      activity: 'Get All Tests Stats',
      status: 'success',
      details: 'All tests stats fetched successfully',
    });

    return res.status(200).json({
      liveTestsCount,
      scheduledTestsCount,
      pastTestsCount
    });
  } catch (err) {
    console.error('Error fetching all tests stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllStudentsStats = async (req, res) => {
  const user_id = req.user.id;
  const exam_for = req.query.exam_for;

  try {
    const totalStudentsQuery = 'SELECT COUNT(*) FROM users WHERE role = $1 AND status = $2';
    const totalStudentsResult = await pool.query(totalStudentsQuery, [exam_for, 'ACTIVE']);

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

const getAllStudentsStatsForDepartment = async (req, res) => {
  const user_id = req.user.id;
  const { department, role } = req.query;
  console.log(req.query);
  

  try {
    const totalStudentsQuery = 'SELECT COUNT(*) FROM users WHERE department = $1 AND status = $2 AND role = $3';
    const totalStudentsResult = await pool.query(totalStudentsQuery, [department, 'ACTIVE', role] );

    const totalStudentsCount = parseInt(totalStudentsResult.rows[0].count, 10);

    await logActivity({
      user_id,
      activity: 'Get All Students Stats for Department',
      status: 'success',
      details: `All students stats for department ${department} fetched successfully`,
    });

    return res.status(200).json({
      totalStudentsCount
    });
  } catch (err) {
    console.error('Error fetching all students stats for department:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getLastExamStats, getAllTestsStats, getAllStudentsStats, getAllStudentsStatsForDepartment };