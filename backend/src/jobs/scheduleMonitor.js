import cron from "node-cron";
import Content from "../modules/content/content.model.js";
import { createNotification } from "../modules/notifications/notification.service.js";

export const initScheduleMonitor = () => {
  // Run every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // Limit batch size to avoid loading all content into memory
      const scheduledContents = await Content.find({
        status: "SCHEDULED",
        scheduledDate: { $ne: null },
        scheduleNotificationSent: { $ne: true },
      })
        .select(
          "title scheduledDate scheduledTime createdBy scheduleNotificationSent",
        )
        .limit(100);

      for (const content of scheduledContents) {
        // Construct the exact scheduled datetime
        const schedDate = new Date(content.scheduledDate);
        let year = schedDate.getFullYear();
        let month = schedDate.getMonth();
        let date = schedDate.getDate();
        let hours = 0;
        let minutes = 0;

        if (content.scheduledTime) {
          const [h, m] = content.scheduledTime.split(":");
          hours = parseInt(h, 10);
          minutes = parseInt(m, 10);
        }

        const exactScheduledTime = new Date(
          year,
          month,
          date,
          hours,
          minutes,
          0,
        );

        // If the current time has passed the scheduled time
        if (now >= exactScheduledTime) {
          // Send notification only to the creator/admin
          await createNotification({
            userId: content.createdBy,
            title: "Content Schedule Time Reached",
            message: `The scheduled time for the content "${content.title}" has arrived. Please verify if it has been published and update its status.`,
            type: "INFO",
            link: `/content`,
          });

          // Mark as notified
          content.scheduleNotificationSent = true;
          await content.save();
        }
      }
    } catch (error) {
      console.error("Error in schedule monitor cron job:", error);
    }
  });

  console.log("⏰ Schedule monitor cron job initialized");
};
