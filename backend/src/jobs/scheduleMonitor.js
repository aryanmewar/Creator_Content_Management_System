import cron from "node-cron";
import Content from "../modules/content/content.model.js";
import User from "../modules/auth/auth.model.js";
import { createNotification } from "../modules/notifications/notification.service.js";

export const initScheduleMonitor = () => {
  // Check every 10 seconds for real-time notifications
  cron.schedule("*/10 * * * * *", async () => {
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
          // Send real-time notification to ALL admins
          const admins = await User.find({ role: "ADMIN" });
          
          for (const admin of admins) {
            await createNotification({
              userId: admin._id,
              title: "⏰ Scheduled Content Posting Time Reached!",
              message: `The scheduled posting time for "${content.title}" has arrived. Please check if the content has been posted, then update its status to PUBLISHED.`,
              type: "WARNING",
              link: `/content/${content._id}`,
            });
          }

          // Mark as notified
          content.scheduleNotificationSent = true;
          await content.save();
        }
      }
    } catch (error) {
      console.error("Error in schedule monitor cron job:", error);
    }
  });

  console.log("⏰ Real-time schedule monitor cron job initialized (runs every 10s)");
};
