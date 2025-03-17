const TextResponse = require("../models/textResponseModel");

exports.createTextResponse = async (req, res) => {
    try {
        const { question_id, response_id, marks_alloted, total_marks, comments, user_id, exam_id } = req.body;

        if (!question_id || !response_id || !user_id || !exam_id) {
            return res.status(400).json({ error: "question_id, response_id, user_id, and exam_id are required." });
        }

        const response = await TextResponse.create({ question_id, response_id, marks_alloted, total_marks, comments, user_id, exam_id });
        res.status(201).json(response);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllTextResponses = async (req, res) => {
    try {
        const responses = await TextResponse.findAll();
        res.json(responses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTextResponseById = async (req, res) => {
    try {
        const response = await TextResponse.findById(req.params.id);
        if (!response) {
            return res.status(404).json({ error: "Text response not found" });
        }
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateTextResponse = async (req, res) => {
    try {
        const updateFields = req.body;
        const response = await TextResponse.update(req.params.id, updateFields);

        if (!response) return res.status(404).json({ error: "Text response not found" });

        res.json(response);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteTextResponse = async (req, res) => {
    try {
        const response = await TextResponse.delete(req.params.id);
        if (!response) {
            return res.status(404).json({ error: "Text response not found" });
        }
        res.json({ message: "Text response deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
