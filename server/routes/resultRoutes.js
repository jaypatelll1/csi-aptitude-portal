const express = require('express');
const {
  createResult,
  getAllresult,
  getResultById,
  UpdateResult,
  deleteResult,
} = require('../controllers/resultController');

const router = express.Router();

// CREATE: Add a new result with server-generated completed_at
router.post('/', createResult);

// READ: Get all results
router.get('/all', getAllresult);

// READ: Get a specific result by ID
router.get('/', getResultById);

// UPDATE: Update a result
router.put('/', UpdateResult);

// DELETE: Delete a result
router.delete('/', deleteResult);

module.exports = router;
