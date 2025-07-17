const cron = require('node-cron');
const pool = require('../config/db');
const { calculateScoreForMCQs } = require('./scoreUtils');
const { user_analysis } = require('./user_anlaysis');
const { generateStudentRanks } = require('../models/rankModel');

// Run this job every minute (adjust schedule as needed)
const autoUpdate = cron.schedule('* * * * *', async () => {
  try {
    // Update exams that are scheduled and have an end_time before the current time
    const result = await pool.query(
      `UPDATE exams SET status = 'past' WHERE status = 'live' AND end_time < CURRENT_TIMESTAMP RETURNING CURRENT_TIMESTAMP, end_time, exam_id, exam_for;` // Use RETURNING to get the updated exam_id
    );

    if (result.rows.length > 0) {
      let generate_rank = true;
      console.log(`${result.rows.length} exams updated to 'past'.`);

      // Process each exam that was updated
      for (const row of result.rows) {
        const examId = row.exam_id;
        const examType = row.exam_for;

        // Check if the exam is for teacher
        if (examType === 'Teacher') {
          console.log(`Skipping the result generation for teacher exam ${examId}`);
          generate_rank = false;
          console.log('generate_rank is set to false');
          continue;
        }

        

        // Fetch student IDs from responses
        const responseResult = await pool.query(
          `SELECT DISTINCT student_id FROM responses WHERE exam_id = $1;`,
          [examId]
        );
        console.log(responseResult.rows);
        const studentIds = responseResult.rows.map((row) => row.student_id);

        // Create results and student analysis for each student
        for (const studentId of studentIds) {
          const result = await calculateScoreForMCQs(examId, studentId)
          await user_analysis(examId, studentId,result);
        }
      }
      if (generate_rank === true) {
        console.log('generate_rank is true');
        await generateStudentRanks();
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
