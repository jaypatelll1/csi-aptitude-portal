const deptModel = require("../models/deptAnalysisModel");

const fetchDepartmentData = async (req, res, fetchFunction) => {
  const { department } = req.params;
  if (!department) {
    return res.status(400).json({ error: "Department is required" });
  }
  try {
    const data = await fetchFunction(department);
    
    if (data.length === 0) {
      return res.status(404).json({ error: "No data found for this department" });
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getDepartmentAvgScore: (req, res) => fetchDepartmentData(req, res, deptModel.getDepartmentAvgScore),
  getDepartmentAvgScorePerExam: (req, res) => fetchDepartmentData(req, res, deptModel.getDepartmentAvgScorePerExam),
  getCategoryPerformance: (req, res) => fetchDepartmentData(req, res, deptModel.getCategoryPerformance),
  getTopPerformer: (req, res) => fetchDepartmentData(req, res, deptModel.getTopPerformer),
  getBottomPerformer: (req, res) => fetchDepartmentData(req, res, deptModel.getBottomPerformer),
  getParticipationRate: (req, res) => fetchDepartmentData(req, res, deptModel.getParticipationRate),
  getParticipationRatePerExam: (req, res) => fetchDepartmentData(req, res, deptModel.getParticipationRatePerExam),
  getAccuracyRate: (req, res) => fetchDepartmentData(req, res, deptModel.getAccuracyRate),
  getWeakAreas: (req, res) => fetchDepartmentData(req, res, deptModel.getWeakAreas),
  getPerformanceOverTime: (req, res) => fetchDepartmentData(req, res, deptModel.getPerformanceOverTime),
};
