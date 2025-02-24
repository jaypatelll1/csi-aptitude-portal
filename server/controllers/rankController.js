const rankModel = require('../models/rankModel');
const { logActivity } = require('../utils/logActivity');

const generateRank = async (req, res) => {

  try {
    const results = await rankModel.generateRank();
    console.log(results)
    
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {generateRank};
