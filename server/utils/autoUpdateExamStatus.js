const cron = require('node-cron');
const pool = require('../config/db');
const { calculateAndStoreTotalScore } = require('./scoreUtils');

// Run this job every minute (adjust schedule as needed)
const autoUpdate = cron.schedule('*/5 * * * *', async () => {
  try {
    // const now = new Date().toISOString();
    // console.log('Current time:', now);

    // Update exams that are scheduled and have an end_time before the current time
    const result = await pool.query(
      `UPDATE exams SET status = 'past' WHERE status = 'live' AND end_time < CURRENT_TIMESTAMP RETURNING CURRENT_TIMESTAMP, end_time, exam_id;` // Use RETURNING to get the updated exam_id
    );

    // console.log(result.rows)

    if (result.rows.length > 0) {
      console.log(`${result.rows.length} exams updated to 'past'.`);
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
