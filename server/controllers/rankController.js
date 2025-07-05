const rankModel = require('../models/rankModel');
const { logActivity } = require('../utils/logActivity');

const generateRank = async (req, res) => {

  try {
    const results = await rankModel.generateRank();
    
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const GetStudentRanksInAscOrder = async(req,res)=>{
  const {filter,department} = req.query
    try {
      const results = await rankModel.getStudentRanksInOrderTpo({filter,department})
      return res.status(200).json(results)
    } catch (error) {
     return res.status(500).json({ error: error.message });
    }
}

module.exports = {generateRank,GetStudentRanksInAscOrder};
