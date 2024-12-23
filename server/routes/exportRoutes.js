const express = require("express");
const { exportToUserCSV,exportToUserExcel,exportToQuestionExcel,exportToQuestionCSV,exportToResultCSV,exportToResultExcel } = require("../controllers/ExportController");
const { jwtAuthMiddleware } = require("../middlewares/jwtAuthMiddleware");
const { authorizeRoles } = require("../middlewares/roleAuthMiddleware");

const router = express.Router();

router.get("/users/csv",jwtAuthMiddleware,authorizeRoles, exportToUserCSV);
router.get("/users/excel",jwtAuthMiddleware,authorizeRoles, exportToUserExcel);

// question export routes
router.get("/question/csv",jwtAuthMiddleware,authorizeRoles,exportToQuestionCSV  );
router.get("/question/excel",jwtAuthMiddleware,authorizeRoles,exportToQuestionExcel);

// result export routes
router.get("/result/csv",jwtAuthMiddleware,authorizeRoles, exportToResultCSV);
router.get("/result/excel",jwtAuthMiddleware,authorizeRoles, exportToResultExcel);

module.exports = router;
