const multer = require("multer");

const storage = multer.memoryStorage();

const s3upload = multer({ storage });



module.exports = s3upload;
