const cron = require('node-cron');
const pool = require('../config/db');

// Run this job every minute
const autoUpdate = cron.schedule('* * * * *', async () => {
  try {
    const now = new Date().toISOString();
    // console.log('now',now);
    
   
    const result = await pool.query(
      `UPDATE exams SET status = 'live' WHERE status = 'scheduled' AND start_time < $1`,
      [now]
    );
    console.log(`${result.rowCount} exams updated to 'live'.`);
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