const cron = require("node-cron");
const { dbWrite } = require("../config/db");

const autoUpdate = cron.schedule("* * * * *", async () => {
  try {

    // scheduled → live
    const liveUpdate = await dbWrite("exams")
      .where("status", "scheduled")
      .andWhere("start_time", "<=", dbWrite.fn.now())
      .update({ status: "live" });

    // live → past
    const pastUpdate = await dbWrite("exams")
      .where("status", "live")
      .andWhere("end_time", "<=", dbWrite.fn.now())
      .update({ status: "past" });

    if (liveUpdate || pastUpdate) {
      console.log(
        `Cron Update: ${liveUpdate} exams → live, ${pastUpdate} exams → past`
      );
    }

  } catch (error) {
    console.error("Cron job error:", error);
  }
});

module.exports = autoUpdate;
