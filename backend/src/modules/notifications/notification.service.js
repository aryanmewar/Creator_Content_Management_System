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
  return await Notification.find({ userId }).sort({ createdAt: -1 }).lean();
};

/**
 * Mark a single notification as read.
 */
export const markAsRead = async (id, userId) => {
  const notification = await Notification.findById(id);
  if (!notification) {
    const err = new Error("Notification not found.");
    err.statusCode = 404;
    err.code = "NOT_FOUND";
    throw err;
  }

  if (notification.userId.toString() !== userId.toString()) {
    const err = new Error("You are not authorized to access this notification.");
    err.statusCode = 403;
    err.code = "FORBIDDEN";
    throw err;
  }

  notification.isRead = true;
  await notification.save();
  return notification;
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
  const notification = await Notification.findById(id);
  if (!notification) {
    const err = new Error("Notification not found.");
    err.statusCode = 404;
    err.code = "NOT_FOUND";
    throw err;
  }

  if (notification.userId.toString() !== userId.toString()) {
    const err = new Error("You are not authorized to delete this notification.");
    err.statusCode = 403;
    err.code = "FORBIDDEN";
    throw err;
  }

  await Notification.findByIdAndDelete(id);
  return true;
};

/**
 * Delete all notifications for a user.
 */
export const deleteAllNotifications = async (userId) => {
  return await Notification.deleteMany({ userId });
};
