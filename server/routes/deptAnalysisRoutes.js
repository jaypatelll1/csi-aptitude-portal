const express = require("express");
const router = express.Router();
const deptController = require("../controllers/deptAnalysisController");

router.get("/average-score/:department", deptController.getDepartmentAvgScore);
router.get("/average-score-per-exam/:department", deptController.getDepartmentAvgScorePerExam);
router.get("/category-performance/:department", deptController.getCategoryPerformance);
router.get("/top-performer/:department", deptController.getTopPerformer);
router.get("/bottom-performer/:department", deptController.getBottomPerformer);
router.get("/participation-rate/:department", deptController.getParticipationRate);
router.get("/participation-rate-per-exam/:department", deptController.getParticipationRatePerExam);
router.get("/accuracy-rate/:department", deptController.getAccuracyRate);
router.get("/weak-areas/:department", deptController.getWeakAreas);
router.get("/performance-over-time/:department", deptController.getPerformanceOverTime);

module.exports = router;
