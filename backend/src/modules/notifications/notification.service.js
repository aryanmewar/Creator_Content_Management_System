import Notification from "./notification.model.js";

/**
 * Create a new notification for a user.
 */
export const createNotification = async ({
  userId,
  title,
  message,
  type = "INFO",
  link = "",
}) => {
  return await Notification.create({
    userId,
    title,
    message,
    type,
    link,
  });
};

/**
 * Get notifications for a user, sorted by latest first.
 */
export const getUserNotifications = async (userId) => {
  return await Notification.find({ userId }).sort({ createdAt: -1 });
};

/**
 * Mark a single notification as read.
 */
export const markAsRead = async (id, userId) => {
  return await Notification.findOneAndUpdate(
    { _id: id, userId },
    { isRead: true },
    { new: true },
  );
};

/**
 * Mark all notifications as read for a user.
 */
export const markAllAsRead = async (userId) => {
  return await Notification.updateMany({ userId }, { isRead: true });
};

/**
 * Delete a specific notification.
 */
export const deleteNotification = async (id, userId) => {
  return await Notification.findOneAndDelete({ _id: id, userId });
};

/**
 * Delete all notifications for a user.
 */
export const deleteAllNotifications = async (userId) => {
  return await Notification.deleteMany({ userId });
};
