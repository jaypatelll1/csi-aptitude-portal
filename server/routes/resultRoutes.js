const express = require('express');
const router = express.Router();
const {query} = require('../config/db');
const {createResult,getAllresult,getResultById,UpdateResult,deleteResult}= require("../controllers/resultController")

// CREATE: Add a new result with server-generated completed_at
router.post('/', createResult);

// READ: Get all results
router.get('/', getAllresult);

// READ: Get a specific result by ID
router.get('/:id', getResultById);

// UPDATE: Update a result
router.put('/:id',UpdateResult );

// DELETE: Delete a result
router.delete('/:id', deleteResult);

module.exports = router;
