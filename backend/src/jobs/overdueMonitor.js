import cron from "node-cron";
import Assignment from "../modules/assignments/assignment.model.js";
import OverdueRecord from "../modules/reports/overdueRecord.model.js";
import { getDeadlineState, getStartOfToday } from "../utils/dateUtils.js";

export const runOverdueCheck = async () => {
  try {
    const now = new Date();
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const today = getStartOfToday();

    // Find all assignments with a deadline in the past
    // The exact check depends on content status, so we fetch and check using the utility
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
