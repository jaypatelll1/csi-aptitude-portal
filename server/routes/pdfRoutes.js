const express = require('express');
const generatePDF = require('../utils/generatePDF');

const router = express.Router();

router.get('/:teacherId/:examId', async (req, res) => {
    const { teacherId, examId } = req.params;
    if (!teacherId || !examId) {
        return res.status(400).send("Missing teacherId or examId");
    }
    await generatePDF(res, teacherId, examId);
});

module.exports = router;
