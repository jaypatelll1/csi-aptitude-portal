const cron = require("node-cron");
const path = require("path");
const { Worker } = require("worker_threads");
const { dbWrite } = require("../config/db");
const { generateStudentRanks, generateDepartmentRanks } = require("../models/rankModel");

let isRunning = false;

console.log("⏰ Exam status cron initialized");

const autoUpdate = cron.schedule("*/5 * * * *", async () => {

  if (isRunning) {
    console.log("⚠️ Previous cron still running. Skipping...");
    return;
  }

  isRunning = true;

  try {

    console.log("⏳ Checking for completed exams...");

    const result = await dbWrite("exams")
      .where("status", "live")
      .andWhere("end_time", "<", dbWrite.fn.now())
      .update({ status: "past" })
      .returning(["exam_id", "exam_for", "exam_name"]);

    if (!result.length) {
      console.log("📭 No exams ended.");
      isRunning = false;
      return;
    }

    console.log(`✅ ${result.length} exams moved to past`);

    let studentExamProcessed = false;

    for (const exam of result) {

      const { exam_id, exam_for, exam_name } = exam;

      if (exam_for === "Teacher") {
        console.log(`🧑‍🏫 Skipping teacher exam ${exam_id}`);
        continue;
      }

      studentExamProcessed = true;

      const studentRows = await dbWrite("responses")
        .distinct("student_id")
        .where({ exam_id });

      const studentIds = studentRows.map(r => r.student_id);

      console.log(`📚 ${studentIds.length} students found for exam ${exam_id}`);

      const batchSize = 10;

      for (let i = 0; i < studentIds.length; i += batchSize) {

        const batch = studentIds.slice(i, i + batchSize);

        const workers = batch.map(studentId =>
          processStudentWorker(exam_id, studentId, exam_name)
        );

        await Promise.allSettled(workers);
      }

      console.log(`✅ Finished processing exam ${exam_id}`);
    }

    if (studentExamProcessed) {
      console.log("🏆 Generating ranks...");

      await generateStudentRanks();
      await generateDepartmentRanks();

      console.log("🏆 Ranking generation complete");
    }

  } catch (error) {
    console.error("❌ Cron error:", error);
  }

  isRunning = false;

});

function processStudentWorker(examId, studentId, examName) {

  return new Promise((resolve, reject) => {

    const workerPath = path.resolve(
      __dirname,
      "../workers/studentWorker.js"
    );

    const worker = new Worker(workerPath, {
      workerData: { examId, studentId, examName }
    });

    worker.on("message", resolve);
    worker.on("error", reject);

    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker exited with code ${code}`));
      }
    });

  });

}

process.on("SIGINT", () => {
  console.log("🛑 Stopping cron...");
  autoUpdate.stop();
  process.exit();
});

module.exports = autoUpdate;
