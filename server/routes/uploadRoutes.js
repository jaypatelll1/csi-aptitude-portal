const express = require("express");
const cloudinary = require("../config/cloudinaryConfig");
const { upload } = require("../middlewares/uploadMiddleware");
const { updateQuestionImage } = require("../models/questionModel");

const router = express.Router();

// Rate Limit
const {limiter} = require("../utils/rateLimitUtils");
// router.use(limiter);

// Upload Image & Update Database
router.post("/upload-image/:exam_id/:question_id", upload.single("image"), async (req, res, next) => {
  const { exam_id, question_id } = req.params;

  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  try {
    // Upload image to Cloudinary
    cloudinary.uploader.upload_stream({ folder: "exam_questions" }, async (error, result) => {
      if (error) return next(error);

      // Update PostgreSQL database with image URL
      const updatedQuestion = await updateQuestionImage(exam_id, question_id, result.secure_url);
      res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        question: updatedQuestion,
      });
    }).end(req.file.buffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
