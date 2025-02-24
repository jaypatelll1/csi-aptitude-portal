const express = require("express");
const router = express.Router();
const deptController = require("../controllers/deptAnalysisController");

router.get("/average-score", deptController.getDepartmentAvgScore);
router.get("/average-score-per-exam", deptController.getDepartmentAvgScorePerExam);
router.get("/category-performance", deptController.getCategoryPerformance);
router.get("/top-performer", deptController.getTopPerformer);
router.get("/bottom-performer", deptController.getBottomPerformer);
router.get("/participation-rate", deptController.getParticipationRate);
router.get("/participation-rate-per-exam", deptController.getParticipationRatePerExam);
router.get("/accuracy-rate", deptController.getAccuracyRate);
router.get("/weak-areas", deptController.getWeakAreas);

module.exports = router;
