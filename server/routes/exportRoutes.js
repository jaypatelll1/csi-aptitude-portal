const express = require("express");
const { exportToUserCSV,exportToUserExcel,exportToQuestionExcel,exportToQuestionCSV,exportToResultCSV,exportToResultExcel } = require("../controllers/ExportController");
const { jwtAuthMiddleware } = require("../middlewares/jwtAuthMiddleware");
const { authorizeRoles } = require("../middlewares/roleAuthMiddleware");

const router = express.Router();

// Rate Limit
const {limiter} = require('../middlewares/rateLimitMiddleware');

router.get("/users/csv",jwtAuthMiddleware,authorizeRoles, exportToUserCSV);
router.get("/users/excel",jwtAuthMiddleware,authorizeRoles, exportToUserExcel);

// question export routes
router.get("/question/csv",jwtAuthMiddleware,authorizeRoles,exportToQuestionCSV  );
router.get("/question/excel",jwtAuthMiddleware,authorizeRoles,exportToQuestionExcel);

// result export routes
router.get("/result/csv/:exam_id",jwtAuthMiddleware,authorizeRoles, exportToResultCSV);
router.get("/result/excel/:exam_id",jwtAuthMiddleware,authorizeRoles, exportToResultExcel);

module.exports = router;