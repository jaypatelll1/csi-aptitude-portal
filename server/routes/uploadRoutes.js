const express = require("express");
const { uploadImage, saveQuestion } = require("../controllers/uploadController");
const { upload } = require("../middlewares/uploadMiddleware");
const { deleteImage } = require("../controllers/uploadController");

const router = express.Router();

// Rate limiter
const {limiter} = require('../middlewares/rateLimitMiddleware');

// Route for uploading an image and updating a question 
router.post("/upload-image", upload.single("image"), uploadImage);



// Route to delete an image from Cloudinary & Database
router.delete("/delete-image/:question_id", deleteImage);

module.exports = router;
