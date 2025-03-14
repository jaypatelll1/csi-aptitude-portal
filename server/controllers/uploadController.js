const cloudinary = require("../config/cloudinaryConfig");
const { updateQuestionImage, saveQuestion: saveQuestionModel, getQuestionById } = require("../models/questionModel");

// Upload Image Logic and Update Question with Image URL
const uploadImage = async (req, res) => {
  const { question_id } = req.body; // Expecting question_id to be provided

  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  try {
    cloudinary.uploader.upload_stream({ folder: "exam_questions" }, async (error, result) => {
      if (error) return res.status(500).json({ error: "Cloudinary upload failed" });

      // If question_id is provided, update the question's image URL
      if (question_id) {
        const updatedQuestion = await updateQuestionImage(question_id, result.secure_url);
        return res.status(200).json({
          success: true,
          message: "Image uploaded and question updated successfully",
          imageUrl: result.secure_url,
          question: updatedQuestion
        });
      }

      // If no question_id, just return the uploaded image URL
      res.status(200).json({ success: true, imageUrl: result.secure_url });
    }).end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Save Question Logic
const saveQuestion = async (req, res) => {
  const { exam_id, question_text, question_type, options, correct_option, correct_options, image_url } = req.body;

  if (!exam_id || !question_text || !question_type || !options) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newQuestion = await saveQuestionModel({ exam_id, question_text, question_type, options, correct_option, correct_options, image_url });
    res.status(201).json({ success: true, question: newQuestion });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
};

// Delete Image Logic
const deleteImage = async (req, res) => {
    const { question_id } = req.params;
  
    if (!question_id) {
      return res.status(400).json({ error: "Missing question ID" });
    }
  
    try {
      console.log("Deleting image for question_id:", question_id);
  
      // Step 1: Fetch existing image
      const question = await getQuestionById(question_id);
      if (!question || !question.image_url) {
        console.log("No image found for question:", question_id);
        return res.status(404).json({ error: "No image found for this question" });
      }
  
      console.log("Found image URL:", question.image_url);
      const imageUrl = question.image_url;
  
      // Extract publicId from Cloudinary URL
      const publicId = imageUrl.split("/").pop().split(".")[0];
      console.log("Cloudinary Public ID:", publicId);
  
      // Step 2: Delete from Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.destroy(`exam_questions/${publicId}`);
      console.log("Cloudinary delete response:", cloudinaryResponse);
  
      if (cloudinaryResponse.result !== "ok") {
        console.log("Cloudinary delete failed:", cloudinaryResponse);
        return res.status(500).json({ error: "Cloudinary delete failed" });
      }
  
      // Step 3: Update database (set image_url to NULL)
      const updatedQuestion = await updateQuestionImage(question_id, null);
      console.log("Database updated successfully:", updatedQuestion);
  
      res.status(200).json({
        success: true,
        message: "Image deleted successfully",
        question: updatedQuestion,
      });
    } catch (err) {
      console.error("Error in deleteImage function:", err);
      res.status(500).json({ error: "Error deleting image", details: err.message });
    }
  };
  
  
module.exports = { uploadImage, saveQuestion, deleteImage};
