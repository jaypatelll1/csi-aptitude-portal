const cron = require('node-cron');
const pool = require('../config/db');
const { calculateAndStoreTotalScore } = require('./scoreUtils');
const { student_analysis } = require('./student_analysis');

// Run this job every minute (adjust schedule as needed)
const autoUpdate = cron.schedule('*/5 * * * *', async () => {
  try {
    // Update exams that are scheduled and have an end_time before the current time
    const result = await pool.query(
      `UPDATE exams SET status = 'past' WHERE status = 'live' AND end_time < CURRENT_TIMESTAMP RETURNING CURRENT_TIMESTAMP, end_time, exam_id;` // Use RETURNING to get the updated exam_id
    );

    if (result.rows.length > 0) {
      console.log(`${result.rows.length} exams updated to 'past'.`);

      // Process each exam that was updated
      for (const row of result.rows) {
        const examId = row.exam_id;
        await calculateAndStoreTotalScore(examId);

        // Fetch student IDs from responses
        const responseResult = await pool.query(
          `SELECT DISTINCT student_id FROM responses WHERE exam_id = $1;`,
          [examId]
        );
        console.log(responseResult.rows);
        const studentIds = responseResult.rows.map((row) => row.student_id);

        // Create results and student analysis for each student
        for (const studentId of studentIds) {
          await student_analysis(examId, studentId);
        }
      }
    } else {
      console.log('No exams were updated.');
    }
  } catch (error) {
    console.error('Error updating exam statuses:', error);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Stopping cron jobs...');
  autoUpdate.stop(); // Stop cron job
  console.log('Exiting process.');
  process.exit();
});
