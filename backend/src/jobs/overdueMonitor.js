import cron from "node-cron";

export const runOverdueCheck = async () => {
  // Overdue history is populated upon status-change (in content.service.js updateContentStatus).
  // Active overdue contents are tracked in real-time via the isOverdue flag on the Content model.
  // This cron is retained for future scheduled batch-processing if needed.
  return;
};

export const initOverdueMonitor = () => {
  // Run every day at 12:05 AM (after midnight)
  cron.schedule("5 0 * * *", runOverdueCheck);

  // Run once shortly after startup to catch up
  setTimeout(runOverdueCheck, 10000);

  console.log("⏰ Overdue monitor cron job initialized");
};
