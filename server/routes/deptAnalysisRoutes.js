const express = require("express");
const { getAllDeptAnalysis, getAllDepartmentParams } = require("../controllers/deptAnalysisController");
const router = express.Router();

// Rate Limit
const {limiter} = require('../middlewares/rateLimitMiddleware');

// router.get("/average-score/:department", deptController.getDepartmentAvgScore);
// router.get("/average-score-per-exam/:department", deptController.getDepartmentAvgScorePerExam);
// router.get("/category-performance/:department", deptController.getCategoryPerformance);
// router.get("/top-performer/:department", deptController.getTopPerformer);
// router.get("/bottom-performer/:department", deptController.getBottomPerformer);
// router.get("/participation-rate/:department", deptController.getParticipationRate);
// router.get("/participation-rate-per-exam/:department", deptController.getParticipationRatePerExam);
// router.get("/accuracy-rate/:department", deptController.getAccuracyRate);
// router.get("/weak-areas/:department", deptController.getWeakAreas);
// router.get("/performance-over-time/:department", deptController.getPerformanceOverTime);

router.get("/get-all-department-data/:department", getAllDepartmentParams);

// using this route
router.get('/all-dept-analysis/:department', getAllDeptAnalysis)

module.exports = router;
