// routes/exportRoutes.js
const express = require("express");
const { getHomepage,uploadFile } = require("../controllers/ImportUserController");
const {upload} = require("../middlewares/ImportMiddleware")
const {uploadQuestionFile} = require("../controllers/Importquestion")

const router = express.Router();


router.get("/",getHomepage);

// Export to Excel
router.post("/upload",upload.single('Files'),uploadFile);


router.post("/:exam_id/questions",upload.single("questions"),uploadQuestionFile)

module.exports = router;
