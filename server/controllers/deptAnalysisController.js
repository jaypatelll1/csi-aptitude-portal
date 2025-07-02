const deptModel = require('../models/deptAnalysisModel');
const {
  fetchAndCacheAnalytics,
  getCachedAnalytics, trackAttempt
} = require('../utils/cacheUtils');

const getAllDepartmentParams = async (req, res) => {
  try {
    const { department } = req.params;

    const [
      departmentAvgScore,
      departmentAvgScorePerExam,
      categoryPerformance,
      topPerformer,
      bottomPerformer,
      participationRate,
      participationRatePerExam,
      accuracyRate,
      weakAreas,
      performanceOverTime,
      studentCount,
    ] = await Promise.all([
      deptModel.getDepartmentAvgScore(department),
      deptModel.getDepartmentAvgScorePerExam(department),
      deptModel.getCategoryPerformance(department),
      deptModel.getTopPerformer(department),
      deptModel.getBottomPerformer(department),
      deptModel.getParticipationRate(department),
      deptModel.getParticipationRatePerExam(department),
      deptModel.getAccuracyRate(department),
      deptModel.getWeakAreas(department),
      deptModel.getPerformanceOverTime(department),
      deptModel.getStudentCountByDepartment(department),
    ]);

    res.status(200).json({
      department: department,
      departmentAvgScore,
      departmentAvgScorePerExam,
      categoryPerformance,
      topPerformer,
      bottomPerformer,
      participationRate,
      participationRatePerExam,
      accuracyRate,
      weakAreas,
      performanceOverTime,
      studentCount,
    });
  } catch (error) {
    console.error('Error fetching student performance:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



const getAllDeptAnalysis = async (req, res) => {
  const { department } = req.params;
  if (!department) {
    return res.status(400).json({ error: 'Department is required' });
  }

  const cacheKey = `analytics:department:${department}`;

  try {
    const cachedData = await getCachedAnalytics(cacheKey);
    if (cachedData) {
      console.log(`Cache Hit: Returning cached analytics for ${cacheKey}`);
      return res.json(JSON.parse(cachedData));
    }

    // Cache Miss
    console.log(`Cache Miss: Fetching analytics for ${cacheKey} from DB`);

    const [
      category_performance,
      top_performer,
      bottom_performer,
      participation_rate,
      accuracy_rate,
      performance_over_time,
      dept_ranks,
      studentCount,
    ] = await Promise.all([
      deptModel.getCategoryPerformance(department),
      deptModel.getTopPerformer(department),
      deptModel.getBottomPerformer(department),
      deptModel.getParticipationRate(department),
      deptModel.getAccuracyRate(department),
      deptModel.getPerformanceOverTime(department),
      deptModel.deptRanks(department),
      deptModel.getStudentCountByDepartment(department),
    ]);

    const analyticsData = {
      category_performance,
      top_performer,
      bottom_performer,
      participation_rate,
      accuracy_rate,
      performance_over_time,
      dept_ranks,
      studentCount,
    };

    await fetchAndCacheAnalytics(cacheKey, analyticsData);

    return res.status(200).json({ category_performance,
      top_performer,
      bottom_performer,
      participation_rate,
      accuracy_rate,
      performance_over_time,
      dept_ranks,
      studentCount
     });
  } catch (error) {
    console.error('Error in getAllDeptAnalysis:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};





module.exports = { getAllDeptAnalysis, getAllDepartmentParams ,getAllDeptAnalysis};
