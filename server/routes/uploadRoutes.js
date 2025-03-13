// const express = require("express");
// const cloudinary = require("../config/cloudinaryConfig");
// const { upload } = require("../middlewares/uploadMiddleware");
// const { updateQuestionImage } = require("../models/questionModel");

// const router = express.Router();

// // Rate Limit
// const {limiter} = require("../utils/rateLimitUtils");
// // router.use(limiter);

// // Upload Image & Update Database
// router.post("/upload-image/:exam_id/:question_id", upload.single("image"), async (req, res, next) => {
//   const { exam_id, question_id } = req.params;

//   if (!req.file) {
//     return res.status(400).json({ error: "No image uploaded" });
//   }

//   try {
//     // Upload image to Cloudinary
//     cloudinary.uploader.upload_stream({ folder: "exam_questions" }, async (error, result) => {
//       if (error) return next(error);

//       // Update PostgreSQL database with image URL
//       const updatedQuestion = await updateQuestionImage(exam_id, question_id, result.secure_url);
//       res.status(200).json({
//         success: true,
//         message: "Image uploaded successfully",
//         question: updatedQuestion,
//       });
//     }).end(req.file.buffer);
//   } catch (err) {
//     next(err);
//   }
// });

// module.exports = router;

const express = require("express");
const cloudinary = require("../config/cloudinaryConfig");
const { upload } = require("../middlewares/uploadMiddleware");
const { updateQuestionImage, saveQuestion } = require("../models/questionModel");

const router = express.Router();

// Upload Image Route (When clicking "Upload Image")
router.post("/upload-image", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  try {
    // Upload image to Cloudinary
    cloudinary.uploader.upload_stream({ folder: "exam_questions" }, (error, result) => {
      if (error) return res.status(500).json({ error: "Cloudinary upload failed" });

      res.status(200).json({ success: true, imageUrl: result.secure_url });
    }).end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Save Question Route (When clicking "Save and Add Next")
router.post("/save-question", async (req, res) => {
  const { exam_id, question_text, question_type, options, correct_option, correct_options, image_url } = req.body;

  if (!exam_id || !question_text || !question_type || !options) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newQuestion = await saveQuestion({ exam_id, question_text, question_type, options, correct_option, correct_options, image_url });
    res.status(201).json({ success: true, question: newQuestion });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;

