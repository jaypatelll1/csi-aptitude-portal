const resultModel = require("../models/resultModel")
const {query} = require('../config/db');

const createResult = async (req, res) => {
    const { student_id, exam_id, total_score, max_score } = req.body;
  
    // Generate the current timestamp on the server
    const completed_at = new Date().toISOString();
  
    const queryText = `
      INSERT INTO results (student_id, exam_id, total_score, max_score, completed_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
  
    try {
      const result = await query(queryText, [student_id, exam_id, total_score, max_score, completed_at]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating result:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

const getAllresult = async (req, res) => {
    const query = 'SELECT * FROM results;';
  
    try {
      const results = await query(queryText);
      res.status(200).json(results.rows);
    } catch (err) {
      console.error('Error fetching results:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }


  const getResultById = async (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM results WHERE result_id = $1;';
  
    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Result not found' });
      }
      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching result:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  const UpdateResult = async (req, res) => {
    const { id } = req.params;
    const { total_score, max_score } = req.body;
  
    // Generate the current timestamp on the server for updated completed_at
    const completed_at = new Date().toISOString();
  
    const query = `
      UPDATE results
      SET total_score = $1, max_score = $2, completed_at = $3
      WHERE result_id = $4
      RETURNING *;
    `;
  
    try {
      const result = await pool.query(query, [total_score, max_score, completed_at, id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Result not found' });
      }
      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error updating result:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  const deleteResult =async (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM results WHERE result_id = $1 RETURNING *;';
  
    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Result not found' });
      }
      res.status(200).json({ message: 'Result deleted successfully', result: result.rows[0] });
    } catch (err) {
      console.error('Error deleting result:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  module.exports ={
    createResult,
    getAllresult,
    getResultById,
    UpdateResult,
    deleteResult
  }