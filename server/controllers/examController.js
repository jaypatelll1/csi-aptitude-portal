const examModel = require('../models/examModel');
const { logActivity } = require('../utils/logActivity');

const createExam = async (req, res) => {
  let { name, duration, start_time, end_time, target_years, target_branches } =
    req.body;
  const created_by = req.user.id; // Get user_id from token
  const role = req.user.role; // Get user role from token

  console.log(req.user);

  let formattedTargetYears;
  let formattedTargetBranches;

  // Determine 'exam_for' based on role
  let exam_for;
  if (role === 'TPO' || role === 'Department') {
    exam_for = 'Student';
    if (
      !name ||
      !duration ||
      !created_by ||
      !target_years ||
      !target_branches
    ) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    formattedTargetYears = JSON.stringify(target_years);
    formattedTargetBranches = JSON.stringify(target_branches);

    if (
      typeof formattedTargetBranches &&
      typeof formattedTargetYears === 'string'
    ) {
      formattedTargetBranches = JSON.parse(formattedTargetBranches);
      formattedTargetYears = JSON.parse(formattedTargetYears);
      // console.log('year and branches', formattedTargetBranches, formattedTargetYears);
    } else {
      return res.json({ message: 'input field error ' });
    }
  } else if (role === 'President') {
    exam_for = 'Teacher';
    formattedTargetBranches = null;
    formattedTargetYears = null;
    if (!name || !duration || !created_by) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  } else {
    return res
      .status(403)
      .json({ error: 'Unauthorized role for exam creation' });
  }

  const newExam = await examModel.createExam({
    name,
    duration,
    created_by,
    formattedTargetBranches,
    formattedTargetYears,
    exam_for,
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
  const exam_id = req.headers['x-exam-id'];

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
  const { name, duration, start_time, end_time, status = 'draft' } = req.body;
  const created_by = req.user.id;

  if (!name || !duration || !start_time || !end_time || !created_by) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const updatedExam = await examModel.updateExam({
    exam_id,
    name,
    duration,
    start_time,
    end_time,
    created_by,
    status,
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

const scheduleExam = async (req, res) => {
  const { exam_id } = req.params;
  const { start_time, end_time } = req.body;
  const created_by = req.user.id;
  const scheduledExam = await examModel.scheduleExam(
    exam_id,
    start_time,
    end_time
  );
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
const markLiveExam = async (req, res) => {
  const { exam_id } = req.params;
  const created_by = req.user.id;
  const LiveExam = await examModel.markLiveExam(exam_id);
  if (LiveExam.length === 0) {
    await logActivity({
      user_id: created_by,
      activity: 'Mark Exam as Live',
      status: 'failure',
      details: 'Could not mark Exam as live',
    });
    return res.json({
      message: 'Could not mark Exam as live',
    });
  }
  await logActivity({
    user_id: created_by,
    activity: 'Mark Exam as live',
    status: 'success',
    details: 'Marked Exam as live successfully',
  });
  res
    .status(201)
    .json({ message: 'Marked Exam as live successfully', LiveExam });
};

const deleteExam = async (req, res) => {
  const id = req.user.id;
  const { exam_id } = req.params;
  const deletedExam = await examModel.deleteExam(exam_id);
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

const getPaginatedScheduledExams = async (req, res) => {
  const user_id = req.user.id;
  let status = 'scheduled',
    Count,
    exams;
  const { page, limit, role } = req.query;
  console.log('page is ', page, limit);

  try {
    if (!page && !limit) {
      Count = await examModel.ExamCount(status, role);
      exams = await examModel.getExamsByStatus(status, role);
      await logActivity({
        user_id,
        activity: `Viewed paginated scheduled exams`,
        status: 'success',
        details: `Page: ${page}, Limit: ${limit}`,
      });
    } else {
      Count = await examModel.ExamCount(status, role);
      exams = await examModel.getPaginatedExams(
        parseInt(page),
        parseInt(limit),
        status,
        role
      );
      await logActivity({
        user_id,
        activity: `Viewed paginated published exams`,
        status: 'success',
        details: `Page: ${page}, Limit: ${limit}`,
      });
    }
    res.status(200).json({
      message: 'Exams retrieved successfully',
      exams: exams || [],
      Count: Count || 0,
      ...(page && limit
        ? { page: parseInt(page), limit: parseInt(limit) }
        : {}),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getPaginatedDraftedExams = async (req, res) => {
  const user_id = req.user.id;
  let status = 'draft',
    Count,
    exams;
  const { page, limit, role } = req.query;
  console.log('page is ', page, limit);
  console.log(role);
  try {
    if (!page && !limit) {
      Count = await examModel.ExamCount(status, role);
      exams = await examModel.getExamsByStatus(status, role);
      await logActivity({
        user_id,
        activity: `Viewed paginated draft exams`,
        status: 'success',
        details: `Page: ${page}, Limit: ${limit}`,
      });
    } else {
      Count = await examModel.ExamCount(status, role);
      exams = await examModel.getPaginatedExams(
        parseInt(page),
        parseInt(limit),
        status,
        role
      );
      console.log(exams);
      await logActivity({
        user_id,
        activity: `Viewed paginated published exams`,
        status: 'success',
        details: `Page: ${page}, Limit: ${limit}`,
      });
    }
    res.status(200).json({
      message: 'Exams retrieved successfully',
      exams: exams || [],
      Count: Count || 0,
      ...(page && limit
        ? { page: parseInt(page), limit: parseInt(limit) }
        : {}),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getPaginatedLiveExams = async (req, res) => {
  const user_id = req.user.id;
  let status = 'live',
    Count,
    exams;
  const { page, limit, role } = req.query;
  console.log('page is ', page, limit);

  try {
    if (!page && !limit) {
      Count = await examModel.ExamCount(status, role);
      exams = await examModel.getExamsByStatus(status, role);
      await logActivity({
        user_id,
        activity: `Viewed paginated scheduled exams`,
        status: 'success',
        details: `Page: ${page}, Limit: ${limit}`,
      });
    } else {
      Count = await examModel.ExamCount(status, role);
      exams = await examModel.getPaginatedExams(
        parseInt(page),
        parseInt(limit),
        status,
        role
      );
      await logActivity({
        user_id,
        activity: `Viewed paginated published exams`,
        status: 'success',
        details: `Page: ${page}, Limit: ${limit}`,
      });
    }
    res.status(200).json({
      message: 'Exams retrieved successfully',
      exams: exams || [],
      Count: Count || 0,
      ...(page && limit
        ? { page: parseInt(page), limit: parseInt(limit) }
        : {}),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getPaginatedPastExams = async (req, res) => {
  const user_id = req.user.id;
  let status = 'past',
    Count,
    exams;
  const { page, limit, role } = req.query;
  console.log('page is ', page, limit);

  try {
    if (!page && !limit) {
      Count = await examModel.ExamCount(status, role);
      exams = await examModel.getExamsByStatus(status, role);
      await logActivity({
        user_id,
        activity: `Viewed paginated scheduled exams`,
        status: 'success',
        details: `Page: ${page}, Limit: ${limit}`,
      });
    } else {
      Count = await examModel.ExamCount(status, role);
      exams = await examModel.getPaginatedExams(
        parseInt(page),
        parseInt(limit),
        status,
        role
      );
      await logActivity({
        user_id,
        activity: `Viewed paginated published exams`,
        status: 'success',
        details: `Page: ${page}, Limit: ${limit}`,
      });
    }
    res.status(200).json({
      message: 'Exams retrieved successfully',
      exams: exams || [],
      Count: Count || 0,
      ...(page && limit
        ? { page: parseInt(page), limit: parseInt(limit) }
        : {}),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getExamsForUser = async (req, res) => {
  console.log(req.params);
  const user_id = req.user.id;

  const { status, target_branches, target_years } = req.query; //
  // console.log('status, target_branches, target_year', status, target_branches, target_years);

  try {
    const exams = await examModel.getExamsForUser(
      status,
      target_branches,
      target_years
    );

    await logActivity({
      user_id,
      activity: `Viewed exams for user`,
      status: 'success',
      details: `Filters applied: Status = ${status}`,
    });

    res.status(200).json({
      message: 'Exams for user retrieved successfully',
      exams: exams.rows || [],
      count: exams.rowCount || 0,
    });
  } catch (error) {
    console.error('Error fetching exams for user:', error.message);

    res.status(500).json({ error: error.message });
  }
};

const getExamForTeachers = async (req, res) => {
  const user_id = req.user.id;

  const { status } = req.query;
  // console.log('status, target_branches, target_year', status, target_branches, target_years, page , limit);
  console.log(status);
  try {
    const exams = await examModel.getExamsForTeachers(status);
    console.log(exams);

    await logActivity({
      user_id,
      activity: `Viewed exams for teachers`,
      status: 'success',
      details: `Filters applied: Status = ${status}`,
    });

    res.status(200).json({
      message: 'Exams for teachers retrieved successfully',
      exams: exams.rows || [],
      count: exams.rowCount || 0,
    });
  } catch (error) {
    console.error('Error fetching exams for teachers:', error.message);

    res.status(500).json({ error: error.message });
  }
};

// Function to get exam status
const getExamStatus = async (req, res) => {
  try {
    const { exam_id } = req.params;

    const result = await examModel.getExamStatusById(exam_id);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching exam status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to get list of exams attempted by teacher
const getExamsAttemptedByTeacherId = async (req, res) => {
  const { teacher_id } = req.params;
  try {
    const examList = await examModel.getExamsByTeacherId(teacher_id);
    res.status(200).json({ ExamList: examList });
  } catch (err) {
    console.log('Error: ', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  getAllPaginatedExams,
  getPaginatedDraftedExams,
  getPaginatedScheduledExams,
  getPaginatedPastExams,
  getPaginatedLiveExams,
  scheduleExam,
  markLiveExam,
  markPastExam,
  getExamsForUser,
  getExamStatus,
  getExamForTeachers,
  getExamsAttemptedByTeacherId,
};
