const express = require("express");
const router = express.Router();
const textResponseController = require("../controllers/textResponseController");

// Create a new text response
router.post("/", textResponseController.createTextResponse);

// Update an existing text response
router.put("/:id", textResponseController.updateTextResponse);

// Delete a text response
router.delete("/:id", textResponseController.deleteTextResponse);

// Get all text responses
router.get("/", textResponseController.getAllTextResponses);

// Get a specific text response by ID
router.get("/:id", textResponseController.getTextResponseById);

module.exports = router;
