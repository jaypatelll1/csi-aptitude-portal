const { getLastExam } = require('../models/examModel');
const { logActivity } = require('../utils/logger');
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

    return res.status(200).json({ examId: lastExam.exam_id, studentCount });
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

module.exports = { getLastExamStats };
