const express = require("express");
const router = express.Router();

const s3upload = require("../middlewares/s3uploadMiddleware");
const { uploadImage, deleteImage } = require("../controllers/uploadController");



// Rate limiter
const {limiter} = require('../middlewares/rateLimitMiddleware');

// Route for uploading an image and updating a question 
router.post("/upload-image", limiter(5), s3upload.single("image"), uploadImage);

// Route to delete an image from Cloudinary & Database
router.delete("/delete-image/:key", deleteImage);

module.exports = router;


