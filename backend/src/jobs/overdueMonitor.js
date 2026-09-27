import cron from "node-cron";
import Assignment from "../modules/assignments/assignment.model.js";
import OverdueRecord from "../modules/reports/overdueRecord.model.js";
import { getDeadlineState, getStartOfToday } from "../utils/dateUtils.js";

export const runOverdueCheck = async () => {
  // As per requirement: active overdue contents should NOT enter history.
  // History is only populated upon status change (in updateContentStatus).
  return;
  
  try {
    const assignments = await Assignment.find({
      deadline: { $lt: today },
      status: { $nin: ["APPROVED", "PUBLISHED", "SCHEDULED"] },
    }).populate("contentId", "status title");

    let newRecords = 0;
    for (const asgn of assignments) {
      if (!asgn.contentId) continue;

      const state = getDeadlineState(asgn.deadline, asgn.contentId.status);

      if (state === "OVERDUE") {
        const result = await OverdueRecord.updateOne(
          {
            contentId: asgn.contentId._id,
            instructorId: asgn.instructorId,
            monthYear,
          },
          { $setOnInsert: { recordedAt: new Date() } },
          { upsert: true },
        );
        if (result.upsertedCount > 0) newRecords++;
      }
    }

    if (newRecords > 0) {
      console.log(
        `⏰ Logged ${newRecords} new overdue events for ${monthYear}`,
      );
    }
  } catch (error) {
    console.error("Error in overdue monitor job:", error);
  }
};

export const initOverdueMonitor = () => {
  // Run every day at 12:05 AM (after midnight)
  cron.schedule("5 0 * * *", runOverdueCheck);

  // Run once shortly after startup to catch up
  setTimeout(runOverdueCheck, 10000);

  console.log("⏰ Overdue monitor cron job initialized");
};
