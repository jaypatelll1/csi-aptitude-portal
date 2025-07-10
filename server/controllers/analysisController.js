const analysisModel = require('../models/analysisModel');
const { getCachedAnalytics, fetchAndCacheAnalytics } = require('../utils/cacheUtils');
const { logActivity } = require('../utils/logActivity');
const { student_analysis } = require('../utils/student_analysis');


const getDepartmentAnalysis = async (req, res) => {
  const { department_name } = req.params; // from route param
  const { year } = req.query;             // from query param

  try {
    // Fetch main department analysis data
    const result = await analysisModel.getDepartmentAnalysis(department_name, year);

    if (!result || result.length === 0) {
      return res.status(404).json({ message: 'Department analysis not found.' });
    }

    // Fetch top 5 and weak 5 scorers in the department
    const [top_scorers, weak_scorers] = await Promise.all([
      analysisModel.deptTopScorers(department_name),
      analysisModel.deptWeakScorers(department_name)
    ]);

    // Send full response
    res.status(200).json({
      department_analysis: result,
      top_scorers,
      weak_scorers
    });

  } catch (error) {
    console.error('Error fetching department analysis:', error.message);
    res.status(500).json({ error: error.message });
  }
};


const getUserAnalysis = async (req, res) => {
  const { student_id } = req.params;

  try {
    const result = await analysisModel.getUserAnalysisById(student_id);

    if (!result) {
      return res.status(404).json({ message: 'User analysis not found.' });
    }

    res.status(200).json({ result });
  } catch (error) {
    console.error('Error fetching user analysis:', error.message);
    res.status(500).json({ error: error.message });
  }
};


const deptUserAnalysis = async (req, res) => {
  const { student_id } = req.params;

  try {
    const result = await analysisModel.dept_user_analysis(req.query.department_name);

    if (!result || result.length === 0) {
      await logActivity({
        user_id: student_id,
        activity: 'View overall Results',
        status: 'failure',
        details: 'Results not found',
      });
      return res.status(404).json({ message: 'Results not found.' });
    }

    await logActivity({
      user_id: student_id,
      activity: 'View overall Results',
      status: 'success',
      details: 'Results found',
    });

    res.status(200).json({ results: result });
  } catch (error) {
    console.error('❌ Error in userAnalysis:', error);
    res.status(500).json({ error: error.message });
  }
};


const userAnalysis = async (req, res) => {
  const { student_id } = req.params;

  try {
    const result = await analysisModel.user_analysis(req.query.year);

    if (!result || result.length === 0) {
      await logActivity({
        user_id: student_id,
        activity: 'View overall Results',
        status: 'failure',
        details: 'Results not found',
      });
      return res.status(404).json({ message: 'Results not found.' });
    }

    await logActivity({
      user_id: student_id,
      activity: 'View overall Results',
      status: 'success',
      details: 'Results found',
    });

    res.status(200).json({ results: result });
  } catch (error) {
    console.error('❌ Error in userAnalysis:', error);
    res.status(500).json({ error: error.message });
  }
};

const getSingleUserAnalysis = async (req, res) => {
  const { student_id } = req.params;

  try {
    const result = await analysisModel.getSingleUserAnalysis(
      student_id,
      req.query.department_name,
      req.query.year
    );

    if (!result || result.length === 0) {
      await logActivity({
        user_id: student_id,
        activity: 'View overall Results',
        status: 'failure',
        details: 'Results not found',
      });
      return res.status(404).json({ message: 'Results not found.' });
    }

    await logActivity({
      user_id: student_id,
      activity: 'View overall Results',
      status: 'success',
      details: 'Results found',
    });

    res.status(200).json({ results: result });
  } catch (error) {
    console.error('❌ Error in getSingleUserAnalysis:', error);
    res.status(500).json({ error: error.message });
  }
};


const overallAnalysis = async (req, res) => {
  const year = req.query.year || 'BE'; // allow filtering by year (default BE)
  const cacheKey = `analytics:overall:${year}`;

  try {
    // Step 1: Check Redis Cache
    const cachedData = await getCachedAnalytics(cacheKey);
    if (cachedData) {
      console.log(`✅ Cache Hit: ${cacheKey}`);
      return res.status(200).json(JSON.parse(cachedData));
    }

    // Step 2: Cache Miss → Fetch from DB
    console.log(`⏳ Cache Miss: Fetching ${cacheKey} from DB`);

    const [
      dept_avg,
      top_performers,
      bottom_performers,
      performance_over_time_raw,
      overall_accuracy_rate
    ] = await Promise.all([
      analysisModel.getDeptAvgScores(year),
      analysisModel.topScorers(year),
      analysisModel.weakScorers(year),
      analysisModel.getAllDepartmentsPerformanceOverTime(),
      analysisModel.overallAccuracyRate(year)
    ]);

    // Transform performance_over_time into an object grouped by department
    const performance_over_time = {};
    performance_over_time_raw.forEach((dept) => {
      performance_over_time[dept.department_name] = dept.performance_over_time;
    });

    // Final response object
    const analyticsData = {
      dept_avg,
      top_performers,
      bottom_performers,
      performance_over_time,
      overall_accuracy_rate
    };

    // Step 3: Cache the result for future requests
    await fetchAndCacheAnalytics(cacheKey, analyticsData);

    // Step 4: Return the response
    return res.status(200).json(analyticsData);

  } catch (error) {
    console.error('❌ Error in getAllTpoAnalysis:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


const getOverallResultsOfAStudent = async (req, res) => {
  const { student_id } = req.params;

  try {
    const results = await analysisModel.getOverallResultsOfAStudent(student_id);
    if (!results) {
      await logActivity({
        user_id: student_id,
        activity: 'View overall Results',
        status: 'failure',
        details: 'Results not found',
      });
      return res.status(404).json({ message: 'Results not found.' });
    }
    await logActivity({
      user_id: student_id,
      activity: 'View overall Results',
      status: 'success',
      details: 'Results found',
    });
    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getResultOfAParticularExam = async (req, res) => {
  const { student_id, exam_id } = req.params;

  try {
    const results = await analysisModel.getResultOfAParticularExam(
      student_id,
      exam_id
    );
    if (!results) {
      await logActivity({
        user_id: student_id,
        activity: 'View Particular Exam Results',
        status: 'failure',
        details: 'Results not found',
      });
      return res.status(404).json({ message: 'Results not found.' });
    }

    await logActivity({
      user_id: student_id,
      activity: 'View Particular Exam Results',
      status: 'success',
      details: 'Results found',
    });
    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const testCompletion = async (req, res) => {
  const { student_id } = req.params;

  try {
    const exams = await analysisModel.testCompletion(student_id);
    if (!exams) {
      await logActivity({
        user_id: student_id,
        activity: 'View No. of Exam Attempted',
        status: 'failure',
        details: 'Results not found',
      });
      return res.status(404).json({ message: 'Results not found.' });
    }

    await logActivity({
      user_id: student_id,
      activity: 'View No. of Exam Attempted',
      status: 'success',
      details: 'Results found',
    });
    res.status(200).json({ exams });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const generateStudentAnalysisUsingId = async (req, res) => {
  const { student_id, exam_id } = req.params;

  try {
    const anlaysis = await student_analysis(exam_id, student_id);
    if (!anlaysis) {
      await logActivity({
        user_id: student_id,
        activity: 'View anlaysis',
        status: 'failure',
        details: 'anlaysis not found',
      });
      return res.status(404).json({ message: 'analysis not found.' });
    }

    await logActivity({
      user_id: student_id,
      activity: 'View anlaysis',
      status: 'success',
      details: 'Results found',
    });
    res.status(200).json({ anlaysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const generateStudentAnalysis = async (req, res) => {
  const result = await analysisModel.generateStudentAnalysis();

  result.map((res) => {
    const { exam_id, student_id } = res;
    student_analysis(exam_id, student_id);
  });
  // console.log(result)
  res.json({
    message: 'Data added successfully in student_analysis table.',
  });
};

const avgResults = async (req, res) => {
  const { student_id } = req.params;

  try {
    const result = await analysisModel.avgResults(student_id);
    if (!result) {
      await logActivity({
        user_id: student_id,
        activity: 'View No. of Exam Attempted',
        status: 'failure',
        details: 'Results not found',
      });
      return res.status(404).json({ message: 'Results not found.' });
    }

    await logActivity({
      user_id: student_id,
      activity: 'View No. of Exam Attempted',
      status: 'success',
      details: 'Results found',
    });
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStudentRank = async (req, res) => {
  const { student_id } = req.params;

  try {
    const result = await analysisModel.getStudentRank(student_id);
    if (!result) {
      await logActivity({
        user_id: student_id,
        activity: 'View Student Rank',
        status: 'failure',
        details: 'Student not found',
      });
      return res.status(404).json({ message: 'Student not found.' });
    }

    await logActivity({
      user_id: student_id,
      activity: 'View Student Rank',
      status: 'success',
      details: 'Rank viewed successfully',
    });
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPerformanceOverTime = async (req, res) => {
  const { student_id } = req.params;

  try {
    const result = await analysisModel.getPerformanceOverTime(student_id);
    if (!result) {
      await logActivity({
        user_id: student_id,
        activity: 'View Student Performance',
        status: 'failure',
        details: 'Student Performance not found',
      });
      return res
        .status(404)
        .json({ message: 'Student Performance not found.' });
    }

    await logActivity({
      user_id: student_id,
      activity: 'View Student Performance',
      status: 'success',
      details: 'Student Performance viewed successfully',
    });
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const generateAllAnalysis = async (req, res) => {
  const student_id = req.headers['x-user-id'] || req.user.id;

  const cacheKey = `analytics:students:${student_id}`

  try {
    // Check Redis first
    const cachedData = await getCachedAnalytics(cacheKey);
    if (cachedData) {
      console.log(`Cache Hit: Returning cached analytics for ${cacheKey}`);
      return res.json(JSON.parse(cachedData));
    } else {
      //  Cache Miss: Fetch from DB
      console.log(`Cache Miss: Fetching analytics for ${cacheKey} from DB`);

      const overall_resultS = await analysisModel.getOverallResultsOfAStudent(student_id);
      const avg_results = await analysisModel.avgResults(student_id);
      const rank = await analysisModel.getStudentRank(student_id);
      const test_completion_data = await analysisModel.testCompletion(student_id);
      const performance_over_time = await analysisModel.getPerformanceOverTime(student_id);

      const analyticsData = {
        overall_resultS,
        avg_results,
        rank,
        test_completion_data,
        performance_over_time,
      };

      // Cache the data
      await fetchAndCacheAnalytics(cacheKey, analyticsData);

      res.status(200).json({
         overall_resultS,
        avg_results,
        rank,
        test_completion_data,
        performance_over_time, });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getOverallResultsOfAStudent,
  getResultOfAParticularExam,
  testCompletion,
  generateStudentAnalysis,
  generateStudentAnalysisUsingId,
  avgResults,
  getStudentRank,
  getPerformanceOverTime,
  generateAllAnalysis,
  getDepartmentAnalysis, //----------------
  getUserAnalysis, //--------------
  userAnalysis,
  deptUserAnalysis,
  getSingleUserAnalysis,
  overallAnalysis
};
