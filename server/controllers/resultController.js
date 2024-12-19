const resultModel = require('../models/resultModel');

const createResult = async (req, res) => {
  const { total_score, max_score } = req.body;
  const { exam_id } = req.params;
  const student_id = req.user.id;

  // Generate the current timestamp on the server
  const completed_at = new Date().toISOString();

  const result = { student_id, exam_id, total_score, max_score, completed_at };
  try {
    const newResult = await resultModel.createResult(result);
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
    if (result == "No Result Found") {
      return res.status(404).json({ error: 'Result not found' });
    }
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching result:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const UpdateResult = async (req, res) => {
  const { exam_id } = req.params;
  const { total_score, max_score } = req.body;

  // Generate the current timestamp on the server for updated completed_at
  const completed_at = new Date().toISOString();
  const result = { total_score, max_score, completed_at, exam_id, student_id };
  try {
    const updatedResult = await resultModel.updateResult(query, result);
    if (updatedResult.rows.length === 0) {
      return res.status(404).json({ error: 'Result not found' });
    }
    res.status(200).json(updatedResult.rows[0]);
  } catch (err) {
    console.error('Error updating result:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteResult = async (req, res) => {
  const exam_id = req.params;
  
  try {
    const result = await resultModel.deleteResult(exam_id);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Result not found' });
    }
    res
      .status(200)
      .json({ message: 'Result deleted successfully', result: result.rows[0] });
  } catch (err) {
    console.error('Error deleting result:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createResult,
  getAllresult,
  getResultById,
  UpdateResult,
  deleteResult,
};
