// workers/studentWorker.js
const { parentPort, workerData } = require('worker_threads');
const { calculateScoreForMCQs } = require('../utils/scoreUtils');
const { user_analysis } = require('../utils/user_anlaysis');
const { department_analysis } = require('../utils/department_Analysis');
const { query } = require('../config/db');

(async () => {
  const { examId, studentId } = workerData;

  try {
    const result = await calculateScoreForMCQs(examId, studentId);
    const analysis = await user_analysis(examId, studentId, result);
    await department_analysis(analysis, examId);

    parentPort.postMessage({ success: true, studentId });
  } catch (err) {
    parentPort.postMessage({
      success: false,
      studentId,
      error: err.message,
      stack: err.stack,
    });
  }
})();
