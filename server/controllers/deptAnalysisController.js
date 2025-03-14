const deptModel = require('../models/deptAnalysisModel');
const {
  fetchAndCacheAnalytics,
  getCachedAnalytics,
} = require('../utils/cache');

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
  
  const cacheKey = `analytics:department:${department}`

  try {
    
    // Check Redis first
    const cachedData = await getCachedAnalytics(cacheKey);
    if (cachedData) {
      console.log(`Cache Hit: Returning cached analytics for ${cacheKey}`);
      return res.json(JSON.parse(cachedData));

    } else {
      //  Cache Miss: Fetch from DB
      console.log(`Cache Miss: Fetching analytics for ${cacheKey} from DB`);

      const category_performance =
        await deptModel.getCategoryPerformance(department);
      const top_performer = await deptModel.getTopPerformer(department);
      const bottom_performer = await deptModel.getBottomPerformer(department);
      const participation_rate =
        await deptModel.getParticipationRate(department);
      const accuracy_rate = await deptModel.getAccuracyRate(department);
      const performance_over_time =
        await deptModel.getPerformanceOverTime(department);

      const dept_ranks = await deptModel.deptRanks(department);

      const analyticsData = {
        category_performance,
        top_performer,
        bottom_performer,
        participation_rate,
        accuracy_rate,
        performance_over_time,
        dept_ranks,
      };

      // Cache the data
      await fetchAndCacheAnalytics(cacheKey, analyticsData);

      return res.json({ analyticsData });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getAllDeptAnalysis, getAllDepartmentParams };
