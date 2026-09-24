import Schedule from "./schedule.model.js";
import Content from "../content/content.model.js";
import Assignment from "../assignments/assignment.model.js";
import { logActivity } from "../activityLog/activityLog.service.js";
import * as notificationService from "../notifications/notification.service.js";
import { CONTENT_STATUSES } from "../../utils/statusUtils.js";

/**
 * Get schedules — optionally filter by month/week/day for calendar view.
 */
export const getSchedules = async ({
  month,
  year,
  week,
  date,
  contentId,
  platform,
  page = 1,
  limit = 50,
}) => {
  const query = { isActive: true };
  if (contentId) query.contentId = contentId;
  if (platform) query.platform = platform;

  if (date) {
    const d = new Date(date);
    const start = new Date(d.setHours(0, 0, 0, 0));
    const end = new Date(d.setHours(23, 59, 59, 999));
    query.scheduledDate = { $gte: start, $lte: end };
  } else if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    query.scheduledDate = { $gte: start, $lte: end };
  }

  const total = await Schedule.countDocuments(query);
  const schedules = await Schedule.find(query)
    .populate("contentId", "title contentType status")
    .populate("createdBy", "name email")
    .sort({ scheduledDate: 1, scheduledTime: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  return {
    data: schedules,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get schedule by ID.
 */
export const getScheduleById = async (id) => {
  const schedule = await Schedule.findById(id)
    .populate("contentId", "title contentType status")
    .populate("createdBy", "name email");

  if (!schedule) {
    const err = new Error("Schedule not found.");
    err.statusCode = 404;
    err.code = "NOT_FOUND";
    throw err;
  }
  return schedule;
};

/**
 * Schedule content for a platform.
 * Business rules:
 *  - Content must be APPROVED
 *  - No active duplicate schedule for same content+platform
 *  - Scheduled date must be in the future
 */
export const createSchedule = async (data, userId) => {
  const { contentId, platform, scheduledDate, scheduledTime, notes } = data;

  const content = await Content.findById(contentId);
  if (!content) {
    const err = new Error("Content not found.");
    err.statusCode = 404;
    err.code = "CONTENT_NOT_FOUND";
    throw err;
  }
  if (
    content.status !== CONTENT_STATUSES.APPROVED &&
    content.status !== CONTENT_STATUSES.SCHEDULED
  ) {
    const err = new Error(
      `Content must be APPROVED before scheduling. Current status: ${content.status}`,
    );
    err.statusCode = 400;
    err.code = "CONTENT_NOT_APPROVED";
    throw err;
  }

  // Check for duplicate active schedule
  const existing = await Schedule.findOne({
    contentId,
    platform,
    isActive: true,
    status: "SCHEDULED",
  });
  if (existing) {
    const err = new Error(
      `An active schedule already exists for this content on ${platform}.`,
    );
    err.statusCode = 409;
    err.code = "DUPLICATE_SCHEDULE";
    throw err;
  }

  const schedule = await Schedule.create({
    contentId,
    platform,
    scheduledDate,
    scheduledTime,
    notes,
    createdBy: userId,
    status: "SCHEDULED",
    isActive: true,
  });

  // Move content to SCHEDULED if not already
  if (content.status === CONTENT_STATUSES.APPROVED) {
    content.status = CONTENT_STATUSES.SCHEDULED;
    await content.save();
  }

  await logActivity({
    userId,
    action: "CONTENT_SCHEDULED",
    entityType: "Schedule",
    entityId: schedule._id,
    metadata: {
      contentTitle: content.title,
      platform,
      scheduledDate,
      scheduledTime,
    },
  });

  const assignment = await Assignment.findOne({ contentId: content._id }).populate("instructorId");
  if (assignment && assignment.instructorId && assignment.instructorId.userId) {
    await notificationService.createNotification({
      userId: assignment.instructorId.userId,
      title: "Content Scheduled",
      message: `Your content "${content.title}" has been scheduled for ${platform} on ${new Date(scheduledDate).toLocaleDateString()}.`,
      type: "SUCCESS",
      link: "/contributor",
    });
  }

  return schedule.populate(["contentId", "createdBy"]);
};

/**
 * Reschedule — marks old schedule as RESCHEDULED, creates new one.
 */
export const rescheduleContent = async (id, data, userId) => {
  const oldSchedule = await Schedule.findById(id).populate("contentId");
  if (!oldSchedule) {
    const err = new Error("Schedule not found.");
    err.statusCode = 404;
    err.code = "NOT_FOUND";
    throw err;
  }

  // Mark old as rescheduled
  oldSchedule.status = "RESCHEDULED";
  oldSchedule.isActive = false;
  await oldSchedule.save();

  const newSchedule = await Schedule.create({
    contentId: oldSchedule.contentId,
    platform: oldSchedule.platform,
    scheduledDate: data.scheduledDate || oldSchedule.scheduledDate,
    scheduledTime: data.scheduledTime || oldSchedule.scheduledTime,
    notes: data.notes || null,
    createdBy: userId,
    status: "SCHEDULED",
    isActive: true,
    rescheduledFrom: oldSchedule._id,
  });

  await logActivity({
    userId,
    action: "CONTENT_RESCHEDULED",
    entityType: "Schedule",
    entityId: newSchedule._id,
    metadata: {
      platform: oldSchedule.platform,
      oldDate: oldSchedule.scheduledDate,
      newDate: data.scheduledDate,
    },
  });

  return newSchedule.populate(["contentId", "createdBy"]);
};

/**
 * Cancel a schedule.
 */
export const cancelSchedule = async (id, userId) => {
  const schedule = await Schedule.findByIdAndUpdate(
    id,
    { status: "CANCELLED", isActive: false },
    { new: true },
  ).populate("contentId", "title status");

  if (!schedule) {
    const err = new Error("Schedule not found.");
    err.statusCode = 404;
    err.code = "NOT_FOUND";
    throw err;
  }

  await logActivity({
    userId,
    action: "SCHEDULE_CANCELLED",
    entityType: "Schedule",
    entityId: schedule._id,
    metadata: {
      platform: schedule.platform,
      contentTitle: schedule.contentId?.title,
    },
  });

  return schedule;
};
