const express = require("express");
const router = express.Router();
const deptController = require("../controllers/deptAnalysisController");

router.get("/average-score", deptController.getDepartmentAvgScore);
router.get("/category-performance", deptController.getCategoryPerformance);
router.get("/top-performer", deptController.getTopPerformer);
router.get("/bottom-performer", deptController.getBottomPerformer);
router.get("/participation-rate", deptController.getParticipationRate);
router.get("/accuracy-rate", deptController.getAccuracyRate);
// router.get("/time-spent", deptController.getTimeSpentAnalysis);
router.get("/weak-areas", deptController.getWeakAreas);

module.exports = router;
