const cron = require('node-cron');
const path = require('path');
const { Worker: ThreadWorker } = require('worker_threads');
const {dbWrite} = require('../config/db');
const { generateStudentRanks,generateDepartmentRanks } = require('../models/rankModel');

console.log('⏰ Cron job scheduled to run every minute');

const autoUpdate = cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('⏳ Checking for exams that ended...');

    const result = await dbWrite.raw(
      `UPDATE exams SET status = 'past'
       WHERE status = 'live' AND end_time < CURRENT_TIMESTAMP
       RETURNING CURRENT_TIMESTAMP, end_time, exam_id, exam_for,exam_name;`
    );

    if (result.rows.length > 0) {
      let generate_rank = true;
      console.log(`${result.rows.length} exams updated to 'past'.`);

      for (const row of result.rows) {
        console.log(row)
        const examId = row.exam_id;
        const examType = row.exam_for;
        const examName = row.exam_name;

        if (examType === 'Teacher') {
          console.log(`🧑‍🏫 Skipping teacher exam ${examId}`);
          generate_rank = false;
          continue;
        }

        // Get student IDs for the exam
        const responseResult = await dbWrite.raw(
          `SELECT DISTINCT student_id FROM responses WHERE exam_id = $1`,
          [examId]
        );
        const studentIds = responseResult.rows.map((row) => row.student_id);

        console.log(`📚 Found ${studentIds.length} students for exam ${examId}`);

        // Spawn a thread for each student
        const studentPromises = studentIds.map((studentId) =>
          processStudentInThread(examId, studentId,examName)
        );

        const results = await Promise.allSettled(studentPromises);

        for (const res of results) {
          if (res.status === 'fulfilled') {
            console.log(`✅ Student ${res.value.studentId} processed`);
          } else {
            console.error(`❌ Error for student:`, res.reason);
          }
        }
      }

      if (generate_rank) {
        console.log('🏆 Generating student ranks...');
        await generateStudentRanks();
        await generateDepartmentRanks();
      }

    } else {
      console.log('📭 No exams were updated.');
    }

  } catch (error) {
    console.error('❌ Error in cron job:', error);
  }
});

// Function to spawn a worker thread for student processing
function processStudentInThread(examId, studentId,examName) {
  return new Promise((resolve, reject) => {
    const workerPath = path.resolve(__dirname, '../workers/studentWorker.js');

    const thread = new ThreadWorker(workerPath, {
      workerData: { examId, studentId,examName }
    });

    thread.on('message', resolve);
    thread.on('error', reject);
    thread.on('exit', (code) => {
      if (code !== 0)
        reject(new Error(`Worker thread exited with code ${code}`));
    });
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Stopping cron job...');
  autoUpdate.stop();
  process.exit();
});
