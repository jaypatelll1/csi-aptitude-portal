const deptModel = require('../models/deptAnalysisModel');

const fetchDepartmentData = async (req, res, fetchFunction) => {
  const { department } = req.params;
  if (!department) {
    return res.status(400).json({ error: 'Department is required' });
  }
  try {
    const data = await fetchFunction(department);

    if (data.length === 0) {
      return res
        .status(404)
        .json({ error: 'No data found for this department' });
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

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

  try {
    const category_performance =
      await deptModel.getCategoryPerformance(department);
    const top_performer = await deptModel.getTopPerformer(department);
    const bottom_performer = await deptModel.getBottomPerformer(department);
    const participation_rate = await deptModel.getParticipationRate(department);
    const accuracy_rate = await deptModel.getAccuracyRate(department)
    const performance_over_time = await deptModel.getPerformanceOverTime(department)

    const dept_ranks = await deptModel.deptRanks(department)

    res.json({
      category_performance,
      top_performer,
      bottom_performer,
      participation_rate,
      accuracy_rate,
      performance_over_time,
      dept_ranks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getAllDeptAnalysis, getAllDepartmentParams };
