const tpoAnalysisModel = require('../models/tpoAnalysisModel');
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

module.exports = {
  getDeptAvgScores,
  getTopScorers,
  getWeakScorers,
  getAccuracyRatePerDept,
  getDeptParticipationRate,
  getCategoryWiseAccuracy
};
