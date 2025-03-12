// routes/exportRoutes.js
const express = require("express");
const { uploadFile } = require("../controllers/ImportUserController");
const {upload} = require("../middlewares/ImportMiddleware")
const {uploadQuestionFile} = require("../controllers/ImportQuestionController");
const { jwtAuthMiddleware } = require("../middlewares/jwtAuthMiddleware");
const { authorizeRoles } = require("../middlewares/roleAuthMiddleware");

const router = express.Router();

const {limiter} = require("../utils/rateLimitUtils");
router.use(limiter);


// Export to Excel
router.post("/upload",jwtAuthMiddleware, authorizeRoles,upload.single('Files'),uploadFile);


router.post("/:exam_id/questions",jwtAuthMiddleware, authorizeRoles,upload.single("questions"),uploadQuestionFile)

module.exports = router;
