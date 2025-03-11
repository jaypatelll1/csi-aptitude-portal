const multer = require("multer");

//  Multer Storage (Temporary, since we upload to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal Server Error" });
};

module.exports = { upload, errorHandler };
