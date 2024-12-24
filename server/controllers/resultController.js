const resultModel = require('../models/resultModel');
const { logActivity } = require('../utils/logger');

const createResult = async (req, res) => {
  const { total_score, max_score } = req.body;
  const { exam_id } = req.params;
  const student_id = req.user.id;

  const result = { student_id, exam_id, total_score, max_score, completed_at };
  try {
    const newResult = await resultModel.createResult(result);
    if(!newResult){
      await logActivity({user_id: student_id, activity: 'Create Result', status: 'failure', details: 'Could not create result'});
      return res.status(400).json({ error: 'Could not create result' });
    }
    await logActivity({user_id: student_id, activity: 'Create Result', status: 'success', details: 'Result created successfully'});
    res.status(201).json(newResult);
  } catch (err) {
    console.error('Error creating result:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all results
const getAllresult = async (req, res) => {
  const student_id = req.user.id;
  try {
    const results = await resultModel.getAllResults(student_id);
    if (results.length === 0) {
      await logActivity({ user_id: student_id, activity: 'View All Results', status: 'failure', details: 'No results found' });
      return res.status(404).json({ error: 'No results found' });
    }
    await logActivity({ user_id: student_id, activity: 'View All Results', status: 'success', details: 'Results fetched successfully' });
    return res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching results:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getResultById = async (req, res) => {
  const student_id = req.user.id;
  const { exam_id } = req.params;

  try {
    const result = await resultModel.getResultById(exam_id, student_id);
    if (result == 'No Result Found') {
      await logActivity({ user_id: student_id, activity: 'View Result', status: 'failure', details: 'Result not found' });
      return res.status(404).json({ error: 'Result not found' });
    }
    await logActivity({ user_id: student_id, activity: 'View Result', status: 'success', details: 'Result fetched successfully' });
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching result:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const UpdateResult = async (req, res) => {
  const { exam_id } = req.params;
  const { total_score, max_score } = req.body;
  const student_id = req.user.id;

  // Generate the current timestamp on the server for updated completed_at
  const completed_at = new Date().toISOString();
  const result = { total_score, max_score, completed_at, exam_id, student_id };
  try {
    const updatedResult = await resultModel.updateResult(query, result);
    if (updatedResult.rows.length === 0) {
      await logActivity({ user_id: student_id, activity: 'Update Result', status: 'failure', details: 'Result not found' }); 
      return res.status(404).json({ error: 'Result not found' });
    }
    await logActivity({ user_id: student_id, activity: 'Update Result', status: 'success', details: 'Result updated successfully' });
    res.status(200).json(updatedResult.rows[0]);
  } catch (err) {
    console.error('Error updating result:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteResult = async (req, res) => {
  const exam_id = req.params;
  const student_id = req.user.id;

  try {
    const result = await resultModel.deleteResult(exam_id);
    if (result.rows.length === 0) {
      await logActivity({ user_id: student_id, activity: 'Delete Result', status: 'failure', details: 'Result not found' });
      return res.status(404).json({ error: 'Result not found' });
    }
    await logActivity({ user_id: student_id, activity: 'Delete Result', status: 'success', details: 'Result deleted successfully' });
    res
      .status(200)
      .json({ message: 'Result deleted successfully', result: result.rows[0] });
  } catch (err) {
    console.error('Error deleting result:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Pagination
const getPaginatedResultsByExam = async (req, res) => {
  const { exam_id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  try {
    const results = await resultModel.getPaginatedResultsByExam(
      exam_id,
      parseInt(page),
      parseInt(limit)
    );
    if (!results) {
      await logActivity({
        user_id: student_id,
        activity: 'View Results',
        status: 'failure',
        details: 'Results not found',
      });
      return res.status(404).json({ message: 'Results not found.' });
    }
    await logActivity({
      user_id: student_id,
      activity: 'View Results',
      status: 'success',
      details: 'Results found',
    });
    res
      .status(200)
      .json({ page: parseInt(page), limit: parseInt(limit), results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createResult,
  getAllresult,
  getResultById,
  UpdateResult,
  deleteResult,
  getPaginatedResultsByExam
};