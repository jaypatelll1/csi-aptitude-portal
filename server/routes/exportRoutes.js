const express = require("express");
const { exportToUserCSV,exportToUserExcel,exportToQuestionExcel,exportToQuestionCSV,exportToResultCSV,exportToResultExcel } = require("../controllers/ExportController");

const router = express.Router();

router.get("/users/csv", exportToUserCSV);
router.get("/users/excel", exportToUserExcel);

// question export routes
router.get("/question/csv",exportToQuestionCSV  );
router.get("/question/excel",exportToQuestionExcel);

// result export routes
router.get("/result/csv", exportToResultCSV);
router.get("/result/excel", exportToResultExcel);

module.exports = router;
