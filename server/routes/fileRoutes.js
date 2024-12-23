// routes/exportRoutes.js
const express = require("express");
const { uploadFile } = require("../controllers/ImportUserController");
const {upload} = require("../middlewares/ImportMiddleware")
const {uploadQuestionFile} = require("../controllers/ImportQuestionController")

const router = express.Router();



// Export to Excel
router.post("/upload",upload.single('Files'),uploadFile);


router.post("/:exam_id/questions",upload.single("questions"),uploadQuestionFile)

module.exports = router;
