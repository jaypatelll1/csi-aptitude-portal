const examModel = require('../models/examModel');
const { logActivity } = require('../utils/logger');

const createExam = async (req, res) => {
  const { name, duration, start_time, end_time } = req.body;
  const created_by = req.user.id; // Get user_id from token
  const newExam = await examModel.createExam({
    name,
    duration,
    start_time,
    end_time,
    created_by,
  });
  if (!newExam) {
    await logActivity({
      user_id: created_by,
      activity: 'New Exam',
      status: 'failure',
      details: 'Could not create new exam',
    });
    return res.status(500).json({
      error: 'Server Error',
      message: 'Could not create exam',
    });
  }
  await logActivity({
    user_id: created_by,
    activity: 'New Exam',
    status: 'success',
    details: 'New Exam created successfully and saved as draft',
  });
  res.status(201).json({
    message: 'Exam created successfully and saved as draft',
    newExam,
  });
};

const getExams = async (req, res) => {
  const id = req.user.id; // Get user_id from token
  const exams = await examModel.getExams();
  if (exams.length == 0) {
    await logActivity({
      user_id: id,
      activity: 'View Exam',
      status: 'failure',
      details: 'No Exams found',
    });
    return res.json({
      message: 'No Exams found',
    });
  }
  await logActivity({
    user_id: created_by,
    activity: 'View All Exams',
    status: 'success',
    details: 'View Exams successfully',
  });
  return res.json(exams);
};

// Get Exam by exam_id
const getExamById = async (req, res) => {
  const id = req.user.id; // Get user
  const { exam_id } = req.params;

  console.log('Socket.IO Server Running');

  try {
    const exam = await examModel.getExamById(exam_id);

    if (!exam) {
      await logActivity({
        user_id: id,
        activity: 'View Particular Exam',
        status: 'failure',
        details: 'No Exams found',
      });
      return res.status(404).json({ message: 'Exam not found.' });
    }

    await logActivity({
      user_id: id,
      activity: 'View Particular Exam',
      status: 'success',
      details: 'Viewed Exams details',
    });
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
    await logActivity({
      user_id: created_by,
      activity: 'Update Exam',
      status: 'failure',
      details: 'Could not update Exam details',
    });
    return res.json({
      message: 'Could not update Exam details',
    });
  }
  await logActivity({
    user_id: created_by,
    activity: 'Update Exam',
    status: 'success',
    details: 'Updated Exam details successfully and saved as draft',
  });
  res.status(201).json({
    message: 'Exam details updated successfully and saved as draft',
    updatedExam,
  });
};

const publishExam = async (req, res) => {
  const { exam_id } = req.params;
  const created_by = req.user.id;
  const scheduledExam = await examModel.scheduleExam(exam_id);
  if (!scheduledExam) {
    await logActivity({
      user_id: created_by,
      activity: 'Schedule/Publish Exam',
      status: 'failure',
      details: 'Could not Schedule Exam',
    });
    return res.json({
      message: 'Could not Schedule Exam',
    });
  }
  await logActivity({
    user_id: created_by,
    activity: 'Schedule/Publish Exam',
    status: 'success',
    details: 'Published Exam successfully and saved as scheduled',
  });
  res.status(201).json({
    message: 'Published Exam successfully and saved as scheduled',
    scheduledExam,
  });
};

const markPastExam = async (req, res) => {
  const { exam_id } = req.params;
  const created_by = req.user.id;
  const pastExam = await examModel.markPastExam(exam_id);
  if (pastExam.length === 0) {
    await logActivity({
      user_id: created_by,
      activity: 'Mark Exam as Past',
      status: 'failure',
      details: 'Could not mark Exam as past',
    });
    return res.json({
      message: 'Could not mark Exam as past',
    });
  }
  await logActivity({
    user_id: created_by,
    activity: 'Mark Exam as Past',
    status: 'success',
    details: 'Marked Exam as past successfully',
  });
  res
    .status(201)
    .json({ message: 'Marked Exam as past successfully', pastExam });
};

const deleteExam = async (req, res) => {
  const id = req.user.id;
  const { exam_id } = req.params;
  const deletedExam = await examModel.deleteExam({ exam_id });
  if (!deletedExam) {
    await logActivity({
      user_id: id,
      activity: 'Delete Exam',
      status: 'failure',
      details: 'Could not delete Exam',
    });
    return res.status(400).json({
      message: 'Exam details Not Found',
    });
  }
  await logActivity({
    user_id: id,
    activity: 'Delete Exam',
    status: 'success',
    details: 'Exam deleted successfully',
  });
  res.status(200).json({
    message: 'Exam deleted successfully',
    deletedExam,
  });
};

// Pagination
const getAllPaginatedExams = async (req, res) => {
  const user_id = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  try {
    const exams = await examModel.getAllPaginatedExams(
      parseInt(page),
      parseInt(limit)
    );
    await logActivity({
      user_id,
      activity: `Viewed paginated exams`,
      status: 'success',
      details: `Page: ${page}, Limit: ${limit}`,
    });
    res
      .status(200)
      .json({ page: parseInt(page), limit: parseInt(limit), exams });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPaginatedPublishedExams = async (req, res) => {
  const user_id = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  try {
    const exams = await examModel.getPaginatedPublishedExams(
      parseInt(page),
      parseInt(limit)
    );
    await logActivity({
      user_id,
      activity: `Viewed paginated published exams`,
      status: 'success',
      details: `Page: ${page}, Limit: ${limit}`,
    });
    res
      .status(200)
      .json({ page: parseInt(page), limit: parseInt(limit), exams });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPaginatedDraftededExams = async (req, res) => {
  const user_id = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  try {
    const exams = await examModel.getPaginatedDraftededExams(
      parseInt(page),
      parseInt(limit)
    );
    await logActivity({
      user_id,
      activity: `Viewed paginated drafted exams`,
      status: 'success',
      details: `Page: ${page}, Limit: ${limit}`,
    });
    res
      .status(200)
      .json({ page: parseInt(page), limit: parseInt(limit), exams });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPaginatedPastExams = async (req, res) => {
  const user_id = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  try {
    const exams = await examModel.getPaginatedPastExams(
      parseInt(page),
      parseInt(limit)
    );
    await logActivity({
      user_id,
      activity: `Viewed paginated past exams`,
      status: 'success',
      details: `Page: ${page}, Limit: ${limit}`,
    });
    res
      .status(200)
      .json({ page: parseInt(page), limit: parseInt(limit), exams });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  getAllPaginatedExams,
  publishExam,
  markPastExam,
  getPaginatedDraftededExams,
  getPaginatedPublishedExams,
  getPaginatedPastExams,
};
