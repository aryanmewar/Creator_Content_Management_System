import * as notificationService from "./notification.service.js";
import { sendSuccess } from "../../utils/response.js";

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getUserNotifications(
      req.user._id,
    );
    return sendSuccess(res, { data: notifications });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user._id,
    );
    return sendSuccess(res, {
      message: "Notification marked as read.",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user._id);
    return sendSuccess(res, { message: "All notifications marked as read." });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(req.params.id, req.user._id);
    return sendSuccess(res, { message: "Notification deleted." });
  } catch (error) {
    next(error);
  }
};

export const deleteAllNotifications = async (req, res, next) => {
  try {
    await notificationService.deleteAllNotifications(req.user._id);
    return sendSuccess(res, { message: "All notifications deleted." });
  } catch (error) {
    next(error);
  }
};
