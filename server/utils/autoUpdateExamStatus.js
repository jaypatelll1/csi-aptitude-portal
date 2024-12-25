const cron = require('node-cron');
const pool = require('../config/db');

// Run this job every hour
const autoUpdate = cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const result = await pool.query(
      `UPDATE exams SET status = 'past' WHERE status = 'scheduled' AND end_time < $1`,
      [now]
    );
    console.log(`${result.rowCount} exams updated to 'past'.`);
  } catch (error) {
    console.error('Error updating exam statuses:', error);
  }
});

// Handle SIGINT for graceful shutdown
process.on('SIGINT', async () => {
  console.log('Stopping cron jobs...');
  autoUpdate.stop(); // Stop cron job
  console.log('Exiting process.');
  process.exit();
});
