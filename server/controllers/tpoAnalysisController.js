const tpoAnalysisModel = require('../models/tpoAnalysisModel');
const deptAnalysisModel = require('../models/deptAnalysisModel');
const { logActivity } = require('../utils/logActivity');

const getDeptAvgScores = async (req, res) => {
  const user_id = req.user.id;
  try {
    const results = await tpoAnalysisModel.getDeptAvgScores();
    if (!results) {
      await logActivity({
        user_id: user_id,
        activity: 'View Department-wise Average Scores',
        status: 'failure',
        details: 'Results not found',
      });
      return res.status(404).json({ message: 'Results not found.' });
    }
    await logActivity({
      user_id: user_id,
      activity: 'View Department-wise Average Scores',
      status: 'success',
      details: 'Results found',
    });
    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTopScorers = async (req, res) => {
  const user_id = req.user.id;
  try {
    const results = await tpoAnalysisModel.topScorers();
    if (!results) {
      await logActivity({
        user_id: user_id,
        activity: 'View Top Scorers',
        status: 'failure',
        details: 'Results not found',
      });
      return res.status(404).json({ message: 'Results not found.' });
    }
    await logActivity({
      user_id: user_id,
      activity: 'View Top Scorers',
      status: 'success',
      details: 'Results found',
    });
    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getWeakScorers = async (req, res) => {
  const user_id = req.user.id;
  try {
    const results = await tpoAnalysisModel.weakScorers();
    if (!results) {
      await logActivity({
        user_id: user_id,
        activity: 'View Weak Scorers',
        status: 'failure',
        details: 'Results not found',
      });
      return res.status(404).json({ message: 'Results not found.' });
    }
    await logActivity({
      user_id: user_id,
      activity: 'View Weak Scorers',
      status: 'success',
      details: 'Results found',
    });
    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAccuracyRatePerDept = async (req, res) => {
  const user_id = req.user.id;
  try {
    const results = await tpoAnalysisModel.accuracyRatePerDept();
    if (!results) {
      await logActivity({
        user_id: user_id,
        activity: 'View Accuracy Rate of Each Department',
        status: 'failure',
        details: 'Results not found',
      });
      return res.status(404).json({ message: 'Results not found.' });
    }
    await logActivity({
      user_id: user_id,
      activity: 'View Accuracy Rate of Each Department',
      status: 'success',
      details: 'Results found',
    });
    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDeptParticipationRate = async (req, res) => {
  const user_id = req.user.id;
  try {
    const results = await tpoAnalysisModel.deptParticipationRate();
    if (!results) {
      await logActivity({
        user_id: user_id,
        activity: 'View Participation Rate of Each Department',
        status: 'failure',
        details: 'Results not found',
      });
      return res.status(404).json({ message: 'Results not found.' });
    }
    await logActivity({
      user_id: user_id,
      activity: 'View Participation Rate of Each Department',
      status: 'success',
      details: 'Results found',
    });
    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCategoryWiseAccuracy = async (req, res) => {
  const user_id = req.user.id;
  try {
    const results = await tpoAnalysisModel.categoryWiseAccuracy();
    if (!results) {
      await logActivity({
        user_id: user_id,
        activity: 'View Accuracy Rate of Each Department for each Category',
        status: 'failure',
        details: 'Results not found',
      });
      return res.status(404).json({ message: 'Results not found.' });
    }
    await logActivity({
      user_id: user_id,
      activity: 'View Accuracy Rate of Each Department for each Category',
      status: 'success',
      details: 'Results found',
    });
    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllTpoAnalysis = async (req, res) => {
  const user_id = req.user.id;
  try {
    const dept_avg = await tpoAnalysisModel.getDeptAvgScores();
    const top_performers = await tpoAnalysisModel.topScorers();
    const bottom_performers = await tpoAnalysisModel.weakScorers();
    const participation_rate = await tpoAnalysisModel.totalParticipationRate();

    const dept_cmpn = await tpoAnalysisModel.getPerformanceOverTime('CMPN');
    const dept_inft = await tpoAnalysisModel.getPerformanceOverTime('INFT');
    const dept_ecs = await tpoAnalysisModel.getPerformanceOverTime('ECS');
    const dept_extc = await tpoAnalysisModel.getPerformanceOverTime('EXTC');
    const dept_elec = await tpoAnalysisModel.getPerformanceOverTime('ELEC');

    const performance_over_time = {
      dept_cmpn,
      dept_inft,
      dept_ecs,
      dept_extc,
      dept_elec,
    };

    await logActivity({
      user_id: user_id,
      activity: 'View Overall Analysis',
      status: 'success',
      details: 'Results found',
    });

    res
      .status(200)
      .json({
        dept_avg,
        top_performers,
        bottom_performers,
        participation_rate,
        performance_over_time,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDeptAvgScores,
  getTopScorers,
  getWeakScorers,
  getAccuracyRatePerDept,
  getDeptParticipationRate,
  getCategoryWiseAccuracy,
  getAllTpoAnalysis,
};
