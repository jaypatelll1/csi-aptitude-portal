const express = require("express");
const { uploadImage, saveQuestion } = require("../controllers/uploadController");
const { upload } = require("../middlewares/uploadMiddleware");
const { deleteImage } = require("../controllers/uploadController");

const router = express.Router();

// Route for uploading an image and updating a question 
router.post("/upload-image", upload.single("image"), uploadImage);

// Route for saving a question
router.post("/save-question", saveQuestion);

// Route to delete an image from Cloudinary & Database
router.delete("/delete-image/:question_id", deleteImage);

module.exports = router;
